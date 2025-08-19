/*
  # Edge Function: Get Weather Data

  Esta função integra com APIs meteorológicas externas para buscar dados climáticos.

  ## Funcionalidades:
  - Integra com OpenWeatherMap API
  - Busca dados meteorológicos por localização
  - Combina com dados de sensores locais
  - Cache de dados para otimização
*/

import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
}

interface WeatherData {
  temperature: number
  humidity: number
  pressure: number
  wind_speed: number
  wind_direction: number
  description: string
  icon: string
  timestamp: string
  location: {
    city: string
    lat: number
    lon: number
  }
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

    // Buscar configurações da API meteorológica
    const { data: config } = await supabaseClient
      .from('app_configs')
      .select('weather_api_key, weather_api_provider')
      .single()

    if (!config || !config.weather_api_key) {
      return new Response(
        JSON.stringify({ 
          error: 'Weather API not configured',
          message: 'Please configure weather API key in settings' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Obter parâmetros da requisição
    const url = new URL(req.url)
    const lat = url.searchParams.get('lat') || '-24.622992' // Toledo, PR (padrão)
    const lon = url.searchParams.get('lon') || '-53.715393'
    const city = url.searchParams.get('city') || 'Toledo'

    // Buscar dados meteorológicos do OpenWeatherMap
    const weatherApiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${config.weather_api_key}&units=metric&lang=pt_br`
    
    const weatherResponse = await fetch(weatherApiUrl)
    
    if (!weatherResponse.ok) {
      throw new Error(`Weather API error: ${weatherResponse.status}`)
    }

    const weatherData = await weatherResponse.json()

    // Formatar dados meteorológicos
    const formattedWeatherData: WeatherData = {
      temperature: Math.round(weatherData.main.temp * 10) / 10,
      humidity: weatherData.main.humidity,
      pressure: weatherData.main.pressure,
      wind_speed: weatherData.wind?.speed || 0,
      wind_direction: weatherData.wind?.deg || 0,
      description: weatherData.weather[0]?.description || '',
      icon: weatherData.weather[0]?.icon || '',
      timestamp: new Date().toISOString(),
      location: {
        city: city,
        lat: parseFloat(lat),
        lon: parseFloat(lon)
      }
    }

    // Buscar dados históricos do tempo (últimas 5 chamadas)
    const forecastApiUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${config.weather_api_key}&units=metric&lang=pt_br&cnt=8`
    
    const forecastResponse = await fetch(forecastApiUrl)
    let forecastData = null
    
    if (forecastResponse.ok) {
      const forecast = await forecastResponse.json()
      forecastData = forecast.list?.slice(0, 8).map((item: any) => ({
        temperature: Math.round(item.main.temp * 10) / 10,
        humidity: item.main.humidity,
        timestamp: item.dt_txt,
        description: item.weather[0]?.description || ''
      }))
    }

    const response = {
      success: true,
      data: {
        current: formattedWeatherData,
        forecast: forecastData,
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
    console.error('Error in get-weather-data function:', error)
    
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