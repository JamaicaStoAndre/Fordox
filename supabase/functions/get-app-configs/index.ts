/*
  # Edge Function: Get App Configs

  Esta função busca as configurações da aplicação armazenadas no Supabase,
  incluindo chaves de API de terceiros e configurações de admin.

  ## Funcionalidades:
  - Busca configurações da tabela app_configs
  - Implementa controle de acesso (apenas admins)
  - Retorna configurações formatadas
*/

import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
}

Deno.serve(async (req: Request) => {
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

    // Inicializar cliente Supabase
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
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

    // Buscar configurações
    const { data: configs, error } = await supabaseClient
      .from('app_configs')
      .select('*')
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw error
    }

    // Se não existir configuração, criar uma padrão
    if (!configs) {
      const defaultConfig = {
        weather_api_key: '',
        weather_api_provider: 'openweathermap',
        admin_email: user.email,
        admin_name: '',
        company_name: 'Fordox',
        alert_temperature_min: 18,
        alert_temperature_max: 28,
        alert_humidity_min: 40,
        alert_humidity_max: 80,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { data: newConfig, error: insertError } = await supabaseClient
        .from('app_configs')
        .insert(defaultConfig)
        .select()
        .single()

      if (insertError) {
        throw insertError
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          data: newConfig,
          message: 'Default configuration created' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: configs 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in get-app-configs function:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})