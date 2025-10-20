/*
  # Edge Function: Test Database Connection

  Esta função testa a conectividade com o banco de dados PostgreSQL externo
  onde estão armazenados os dados dos sensores.

  ## Funcionalidades:
  - Testa conexão com PostgreSQL usando variáveis de ambiente
  - Executa uma query simples para validar a conectividade
  - Retorna status detalhado da conexão
  - Implementa autenticação via Supabase Auth
*/

import { createClient } from 'npm:@supabase/supabase-js@2'
import pg from 'npm:pg@8.11.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
}

interface ConnectionTestResult {
  success: boolean
  message: string
  details: {
    host: string
    port: number
    database: string
    user: string
    connection_time?: number
    tables_found?: string[]
    error?: string
  }
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Verificar autenticação
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization header required' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Inicializar cliente Supabase para verificação de auth
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Obter configurações de conexão das variáveis de ambiente
    const dbConfig = {
      host: Deno.env.get('PGHOST'),
      port: parseInt(Deno.env.get('PGPORT') || '5432'),
      database: Deno.env.get('PGDB'),
      user: Deno.env.get('PGUSER'),
      password: Deno.env.get('PGPASSWORD'),
    }

    // Verificar se todas as configurações necessárias estão presentes
    if (!dbConfig.host || !dbConfig.database || !dbConfig.user || !dbConfig.password) {
      const result: ConnectionTestResult = {
        success: false,
        message: 'Configurações de banco de dados incompletas',
        details: {
          host: dbConfig.host || 'NÃO CONFIGURADO',
          port: dbConfig.port,
          database: dbConfig.database || 'NÃO CONFIGURADO',
          user: dbConfig.user || 'NÃO CONFIGURADO',
          error: 'Variáveis de ambiente PGHOST, PGDB, PGUSER ou PGPASSWORD não estão configuradas'
        }
      }

      return new Response(
        JSON.stringify(result),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Tentar conectar ao PostgreSQL
    const startTime = Date.now()
    let client: pg.Client | null = null

    try {
      client = new pg.Client(dbConfig)
      await client.connect()
      
      const connectionTime = Date.now() - startTime

      // Executar uma query simples para testar a conectividade
      const testQuery = 'SELECT version() as version, current_database() as database, current_user as user'
      const versionResult = await client.query(testQuery)
      
      // Listar tabelas disponíveis
      const tablesQuery = `
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        ORDER BY table_name
      `
      const tablesResult = await client.query(tablesQuery)
      const tables = tablesResult.rows.map(row => row.table_name)

      // Verificar se as tabelas esperadas existem
      const expectedTables = ['informacoes', 'sensor', 'grupo']
      const missingTables = expectedTables.filter(table => !tables.includes(table))

      const result: ConnectionTestResult = {
        success: true,
        message: missingTables.length > 0 
          ? `Conexão estabelecida, mas algumas tabelas esperadas não foram encontradas: ${missingTables.join(', ')}`
          : 'Conexão estabelecida com sucesso',
        details: {
          host: dbConfig.host,
          port: dbConfig.port,
          database: dbConfig.database,
          user: dbConfig.user,
          connection_time: connectionTime,
          tables_found: tables
        }
      }

      return new Response(
        JSON.stringify(result),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )

    } catch (dbError) {
      const result: ConnectionTestResult = {
        success: false,
        message: 'Falha ao conectar com o banco de dados',
        details: {
          host: dbConfig.host,
          port: dbConfig.port,
          database: dbConfig.database,
          user: dbConfig.user,
          error: dbError.message
        }
      }

      return new Response(
        JSON.stringify(result),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    } finally {
      if (client) {
        try {
          await client.end()
        } catch (closeError) {
          console.error('Error closing database connection:', closeError)
        }
      }
    }

  } catch (error) {
    console.error('Error in test-db-connection function:', error)
    
    const result: ConnectionTestResult = {
      success: false,
      message: 'Erro interno do servidor',
      details: {
        host: 'N/A',
        port: 0,
        database: 'N/A',
        user: 'N/A',
        error: error.message
      }
    }

    return new Response(
      JSON.stringify(result),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})