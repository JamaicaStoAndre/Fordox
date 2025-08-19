/*
  # Edge Function: Update App Configs

  Esta função atualiza as configurações da aplicação no Supabase.

  ## Funcionalidades:
  - Atualiza configurações na tabela app_configs
  - Implementa controle de acesso (apenas admins)
  - Valida dados de entrada
*/

import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  if (req.method !== 'POST' && req.method !== 'PUT') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
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

    // Ler dados do corpo da requisição
    const requestData = await req.json()

    // Validar dados obrigatórios
    const allowedFields = [
      'weather_api_key',
      'weather_api_provider',
      'admin_name',
      'company_name',
      'alert_temperature_min',
      'alert_temperature_max',
      'alert_humidity_min',
      'alert_humidity_max'
    ]

    const updateData: any = {
      updated_at: new Date().toISOString()
    }

    // Filtrar apenas campos permitidos
    allowedFields.forEach(field => {
      if (requestData[field] !== undefined) {
        updateData[field] = requestData[field]
      }
    })

    // Verificar se existe configuração
    const { data: existingConfig } = await supabaseClient
      .from('app_configs')
      .select('id')
      .single()

    let result
    if (existingConfig) {
      // Atualizar configuração existente
      const { data, error } = await supabaseClient
        .from('app_configs')
        .update(updateData)
        .eq('id', existingConfig.id)
        .select()
        .single()

      if (error) throw error
      result = data
    } else {
      // Criar nova configuração
      updateData.admin_email = user.email
      updateData.created_at = new Date().toISOString()

      const { data, error } = await supabaseClient
        .from('app_configs')
        .insert(updateData)
        .select()
        .single()

      if (error) throw error
      result = data
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: result,
        message: 'Configuration updated successfully' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in update-app-configs function:', error)
    
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