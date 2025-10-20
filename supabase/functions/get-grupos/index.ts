import { createClient } from 'npm:@supabase/supabase-js@2'
import pg from 'npm:pg@8.11.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
}

interface Grupo {
  id: number
  nome: string
  localizacao?: number
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const requiredEnvVars = ['PGHOST', 'PGDB', 'PGUSER', 'PGPASSWORD']
    const missingVars = requiredEnvVars.filter(varName => !Deno.env.get(varName))

    if (missingVars.length > 0) {
      console.error('Missing PostgreSQL environment variables:', missingVars)
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Database configuration error',
          details: `Missing environment variables: ${missingVars.join(', ')}`,
          missing_vars: missingVars
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: 'Authorization header required' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)

    if (authError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid authentication' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const client = new pg.Client({
      host: Deno.env.get('PGHOST'),
      port: parseInt(Deno.env.get('PGPORT') || '5432'),
      database: Deno.env.get('PGDB'),
      user: Deno.env.get('PGUSER'),
      password: Deno.env.get('PGPASSWORD'),
    })

    try {
      await client.connect()
      console.log('PostgreSQL connection successful')
    } catch (dbError) {
      console.error('PostgreSQL connection failed:', dbError)
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Database connection failed',
          details: dbError.message,
          connection_info: {
            host: Deno.env.get('PGHOST'),
            port: Deno.env.get('PGPORT') || '5432',
            database: Deno.env.get('PGDB'),
            user: Deno.env.get('PGUSER')
          }
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const query = `
      SELECT
        id,
        nome,
        localizacao
      FROM public.grupo
      ORDER BY nome ASC
    `

    let result
    try {
      result = await client.query(query)
      console.log(`Query executed successfully, found ${result.rows.length} grupos`)
    } catch (queryError) {
      console.error('Query execution failed:', queryError)
      await client.end()
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Database query failed',
          details: queryError.message,
          query: query
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    try {
      await client.end()
    } catch (closeError) {
      console.warn('Warning: Failed to close database connection:', closeError)
    }

    const grupos: Grupo[] = result.rows.map((row: any) => ({
      id: row.id,
      nome: row.nome,
      localizacao: row.localizacao
    }))

    const response = {
      success: true,
      data: {
        grupos: grupos,
        total: grupos.length,
        last_updated: new Date().toISOString()
      }
    }

    return new Response(
      JSON.stringify(response),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Unexpected error in get-grupos function:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      cause: error.cause
    })

    return new Response(
      JSON.stringify({
        success: false,
        error: 'Internal server error',
        details: error.message,
        error_type: error.name,
        stack: error.stack
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})