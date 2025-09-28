/*
  # Edge Function: Get Raw Data

  Esta função conecta ao PostgreSQL externo e busca dados brutos de uma tabela específica,
  suportando filtros, paginação e ordenação.

  ## Funcionalidades:
  - Conecta ao PostgreSQL usando variáveis de ambiente.
  - Busca dados de uma tabela especificada.
  - Permite filtrar dados por texto em todas as colunas.
  - Implementa paginação para carregar dados em blocos.
  - Permite ordenar os dados por qualquer coluna.
  - Implementa autenticação via Supabase Auth.
  - Proteção contra SQL Injection para nomes de tabelas e colunas.
*/

import { createClient } from 'npm:@supabase/supabase-js@2'
import pg from 'npm:pg@8.11.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
}

Deno.serve(async (req: Request) => {
  // Lida com requisições OPTIONS (preflight CORS)
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // 1. Verificar autenticação do usuário
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization header required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Inicializar cliente Supabase para verificar o token de autenticação
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 2. Configurar conexão com o PostgreSQL externo
    const dbConfig = {
      host: Deno.env.get('PGHOST'),
      port: parseInt(Deno.env.get('PGPORT') || '5432'),
      database: Deno.env.get('PGDB'),
      user: Deno.env.get('PGUSER'),
      password: Deno.env.get('PGPASSWORD'),
    }

    // Verificar se as variáveis de ambiente do banco estão configuradas
    if (!dbConfig.host || !dbConfig.database || !dbConfig.user || !dbConfig.password) {
      return new Response(
        JSON.stringify({ error: 'Database configuration incomplete', details: 'Missing PGHOST, PGDB, PGUSER, or PGPASSWORD environment variables.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const client = new pg.Client(dbConfig)
    await client.connect() // Tentar conectar ao banco de dados

    // 3. Obter parâmetros da requisição (tabela, paginação, filtro, ordenação)
    const url = new URL(req.url)
    const tableName = url.searchParams.get('tableName')
    const page = parseInt(url.searchParams.get('page') || '1')
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10')
    const filter = url.searchParams.get('filter') || ''
    const sortBy = url.searchParams.get('sortBy')
    const sortOrder = url.searchParams.get('sortOrder') || 'ASC' // Padrão: ASC

    // 4. Validar nome da tabela para evitar SQL Injection
    const allowedTables = ['informacoes', 'sensor', 'grupo'] // Lista de tabelas permitidas
    if (!tableName || !allowedTables.includes(tableName)) {
      await client.end()
      return new Response(
        JSON.stringify({ error: 'Invalid or missing table name', allowedTables }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Calcular offset para paginação
    const offset = (page - 1) * pageSize
    let query = `SELECT * FROM public."${tableName}"`
    let countQuery = `SELECT COUNT(*) FROM public."${tableName}"`
    const mainQueryParams: any[] = []
    const countQueryParams: any[] = []
    let mainParamIndex = 1
    let countParamIndex = 1

    // 5. Aplicar filtro se houver
    if (filter) {
      // Buscar nomes das colunas da tabela para aplicar o filtro em todas elas
      const columnNamesResult = await client.query(`
        SELECT column_name
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = $1;
      `, [tableName])
      const columnNames = columnNamesResult.rows.map(row => row.column_name)

      // Construir condições de filtro para cada coluna
      const mainFilterConditions = columnNames.map(col => `CAST("${col}" AS TEXT) ILIKE $${mainParamIndex++}`).join(' OR ')
      const countFilterConditions = columnNames.map(col => `CAST("${col}" AS TEXT) ILIKE $${countParamIndex++}`).join(' OR ')
      
      query += ` WHERE (${mainFilterConditions})`
      countQuery += ` WHERE (${countFilterConditions})`
      
      for (let i = 0; i < columnNames.length; i++) {
        mainQueryParams.push(`%${filter}%`) // Adicionar o valor do filtro para cada coluna (query principal)
        countQueryParams.push(`%${filter}%`) // Adicionar o valor do filtro para cada coluna (query de contagem)
      }
    }

    // 6. Aplicar ordenação se houver
    if (sortBy) {
      // Validar se a coluna de ordenação existe na tabela
      const columnCheckResult = await client.query(`
        SELECT column_name FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = $1 AND column_name = $2;
      `, [tableName, sortBy])

      if (columnCheckResult.rows.length > 0) {
        // Validar a ordem de ordenação (ASC/DESC)
        const validatedSortOrder = ['ASC', 'DESC'].includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'ASC'
        query += ` ORDER BY "${sortBy}" ${validatedSortOrder}`
      } else {
        console.warn(`Invalid sortBy column '${sortBy}' for table '${tableName}'. Ignoring sort.`)
      }
    }

    // 7. Adicionar limites de paginação
    query += ` LIMIT $${mainParamIndex++} OFFSET $${mainParamIndex++}`
    mainQueryParams.push(pageSize, offset)

    // 8. Executar as queries de dados e contagem total em paralelo
    let dataResult, countResult;
    
    // Para a tabela 'informacoes', fazer JOIN com sensor e grupo para obter descrições
    if (tableName === 'informacoes') {
      // Query principal com JOIN
      const joinQuery = `
        SELECT 
          i.id,
          i.sensor,
          s.descricao as sensor_descricao,
          i.valor,
          i.grupo,
          g.nome as grupo_nome,
          i.data_registro,
          i.dispositivo
        FROM public."informacoes" i
        LEFT JOIN public."sensor" s ON i.sensor = s.id
        LEFT JOIN public."grupo" g ON i.grupo = g.id
      `;
      
      const joinCountQuery = `
        SELECT COUNT(*) 
        FROM public."informacoes" i
        LEFT JOIN public."sensor" s ON i.sensor = s.id
        LEFT JOIN public."grupo" g ON i.grupo = g.id
      `;
      
      let finalQuery = joinQuery;
      let finalCountQuery = joinCountQuery;
      const joinMainParams: any[] = [];
      const joinCountParams: any[] = [];
      let joinMainParamIndex = 1;
      let joinCountParamIndex = 1;
      
      // Aplicar filtro se houver
      if (filter) {
        const filterColumns = ['i.id', 'i.sensor', 's.descricao', 'i.valor', 'i.grupo', 'g.nome', 'i.data_registro', 'i.dispositivo'];
        const mainFilterConditions = filterColumns.map(col => `CAST(${col} AS TEXT) ILIKE $${joinMainParamIndex++}`).join(' OR ');
        const countFilterConditions = filterColumns.map(col => `CAST(${col} AS TEXT) ILIKE $${joinCountParamIndex++}`).join(' OR ');
        
        finalQuery += ` WHERE (${mainFilterConditions})`;
        finalCountQuery += ` WHERE (${countFilterConditions})`;
        
        for (let i = 0; i < filterColumns.length; i++) {
          joinMainParams.push(`%${filter}%`);
          joinCountParams.push(`%${filter}%`);
        }
      }
      
      // Aplicar ordenação se houver
      if (sortBy) {
        const validColumns = ['id', 'sensor', 'sensor_descricao', 'valor', 'grupo', 'grupo_nome', 'data_registro', 'dispositivo'];
        if (validColumns.includes(sortBy)) {
          const validatedSortOrder = ['ASC', 'DESC'].includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'ASC';
          finalQuery += ` ORDER BY ${sortBy} ${validatedSortOrder}`;
        }
      }
      
      // Adicionar paginação
      finalQuery += ` LIMIT $${joinMainParamIndex++} OFFSET $${joinMainParamIndex++}`;
      joinMainParams.push(pageSize, offset);
      
      [dataResult, countResult] = await Promise.all([
        client.query(finalQuery, joinMainParams),
        client.query(finalCountQuery, joinCountParams)
      ]);
    } else {
      // Para outras tabelas, usar a query original
      [dataResult, countResult] = await Promise.all([
        client.query(query, mainQueryParams),
        client.query(countQuery, countQueryParams)
      ]);
    }

    await client.end() // Fechar conexão com o banco

    // 9. Preparar a resposta
    const totalRows = parseInt(countResult.rows[0].count, 10)
    const totalPages = Math.ceil(totalRows / pageSize)

    return new Response(
      JSON.stringify({
        success: true,
        data: dataResult.rows,
        meta: {
          totalRows,
          totalPages,
          currentPage: page,
          pageSize,
          tableName,
          filter,
          sortBy,
          sortOrder
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in get-raw-data function:', error)
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        details: error.message,
        stack: error.stack
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})