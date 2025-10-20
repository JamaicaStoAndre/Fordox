import { createClient } from 'npm:@supabase/supabase-js@2'
import pg from 'npm:pg@8.11.3'

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
    const url = new URL(req.url)
    const grupoId = url.searchParams.get('grupo_id')

    console.log('Filtro de grupo recebido:', grupoId)

    const requiredEnvVars = ['PGHOST', 'PGDB', 'PGUSER', 'PGPASSWORD']
    const missingVars = requiredEnvVars.filter(varName => !Deno.env.get(varName))

    if (missingVars.length > 0) {
      console.error('Missing PostgreSQL environment variables:', missingVars)
      return new Response(
        JSON.stringify({
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
        JSON.stringify({ error: 'Authorization header required' }),
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
        JSON.stringify({ error: 'Invalid authentication' }),
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

    let query = `
      SELECT
        i.id,
        i.sensor,
        i.valor,
        i.grupo,
        i.data_registro,
        i.dispositivo,
        s.descricao as sensor_descricao,
        s.tipo as sensor_tipo,
        g.nome as grupo_nome,
        g.localizacao as grupo_localizacao
      FROM public.informacoes i
      LEFT JOIN public.sensor s ON i.sensor = s.id
      LEFT JOIN public.grupo g ON i.grupo = g.id
      WHERE i.data_registro >= NOW() - INTERVAL '24 hours'
    `

    if (grupoId) {
      query += ` AND i.grupo = ${parseInt(grupoId)}`
    }

    query += `
      ORDER BY i.data_registro DESC
      LIMIT 100
    `

    let result
    try {
      result = await client.query(query)
      console.log(`Query executed successfully, found ${result.rows.length} rows`)
    } catch (queryError) {
      console.error('Query execution failed:', queryError)
      await client.end()
      return new Response(
        JSON.stringify({ 
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

    const sensorData: Record<string, any> = {}
    
    result.rows.forEach((row: any) => {
      const sensorKey = `${row.sensor_descricao}_${row.grupo}`
      
      if (!sensorData[sensorKey]) {
        sensorData[sensorKey] = {
          sensor_id: row.sensor,
          sensor_name: row.sensor_descricao,
          sensor_type: row.sensor_tipo,
          grupo_id: row.grupo,
          grupo_name: row.grupo_nome,
          latest_value: row.valor,
          latest_timestamp: row.data_registro,
          readings: []
        }
      }
      
      sensorData[sensorKey].readings.push({
        value: parseFloat(row.valor),
        timestamp: row.data_registro,
        dispositivo: row.dispositivo
      })
    })

    const metrics = {
      temperature: { current: 0, average: 0, min: 0, max: 0, readings: [] },
      humidity: { current: 0, average: 0, min: 0, max: 0, readings: [] },
      water: { current: 0, average: 0, min: 0, max: 0, readings: [] },
      energy: { current: 0, average: 0, min: 0, max: 0, readings: [] },
      feed: { current: 0, average: 0, min: 0, max: 0, readings: [] },
      weight: { current: 0, average: 0, min: 0, max: 0, readings: [] }
    }

    Object.values(sensorData).forEach((sensor: any) => {
      const readings = sensor.readings.map((r: any) => r.value)
      
      if (readings.length === 0) return;
      
      const average = readings.reduce((a: number, b: number) => a + b, 0) / readings.length
      const min = Math.min(...readings)
      const max = Math.max(...readings)
      const current = readings[0] || 0
      const sensorReadings = sensor.readings.slice(0, 10)
      
      if (sensor.sensor_type === 'Celsius' || 
          sensor.sensor_name?.toLowerCase().includes('temperatura') ||
          sensor.sensor_name?.toLowerCase().includes('temp')) {
        metrics.temperature.current = readings[0] || 0
        metrics.temperature.average = average
        metrics.temperature.min = min
        metrics.temperature.max = max
        metrics.temperature.readings = sensorReadings
      }
      else if (sensor.sensor_type === 'Percentual' || 
               sensor.sensor_name?.toLowerCase().includes('umidade') ||
               sensor.sensor_name?.toLowerCase().includes('humidity')) {
        metrics.humidity.current = current
        metrics.humidity.average = average
        metrics.humidity.min = min
        metrics.humidity.max = max
        metrics.humidity.readings = sensorReadings
      }
      else if (sensor.sensor_type === 'Litros' || 
               sensor.sensor_name?.toLowerCase().includes('agua') ||
               sensor.sensor_name?.toLowerCase().includes('water')) {
        metrics.water.current = current
        metrics.water.average = average
        metrics.water.min = min
        metrics.water.max = max
        metrics.water.readings = sensorReadings
      }
      else if (sensor.sensor_type === 'kW' || 
               sensor.sensor_type === 'kw' ||
               sensor.sensor_name?.toLowerCase().includes('energia') ||
               sensor.sensor_name?.toLowerCase().includes('energy')) {
        metrics.energy.current = current
        metrics.energy.average = average
        metrics.energy.min = min
        metrics.energy.max = max
        metrics.energy.readings = sensorReadings
      }
      else if (sensor.sensor_type === 'Kg' || 
               sensor.sensor_type === 'kg' ||
               sensor.sensor_name?.toLowerCase().includes('racao') ||
               sensor.sensor_name?.toLowerCase().includes('feed') ||
               sensor.sensor_name?.toLowerCase().includes('alimento')) {
        metrics.feed.current = current
        metrics.feed.average = average
        metrics.feed.min = min
        metrics.feed.max = max
        metrics.feed.readings = sensorReadings
      }
      else if (sensor.sensor_name?.toLowerCase().includes('peso') ||
               sensor.sensor_name?.toLowerCase().includes('weight') ||
               sensor.sensor_name?.toLowerCase().includes('balanca')) {
        metrics.weight.current = current
        metrics.weight.average = average
        metrics.weight.min = min
        metrics.weight.max = max
        metrics.weight.readings = sensorReadings
      }
    })

    const response = {
      success: true,
      data: {
        sensors: sensorData,
        metrics: metrics,
        total_readings: result.rows.length,
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
    console.error('Unexpected error in get-sensor-data function:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      cause: error.cause
    })
    
    return new Response(
      JSON.stringify({ 
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