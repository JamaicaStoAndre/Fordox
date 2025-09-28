import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

console.log('Supabase URL:', supabaseUrl)
console.log('Supabase Anon Key:', supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : 'NÃO CONFIGURADO')

// Verificar se as variáveis estão configuradas e não são placeholders
const isValidUrl = supabaseUrl && !supabaseUrl.includes('seu-projeto') && !supabaseUrl.includes('your-project-ref')
const isValidKey = supabaseAnonKey && !supabaseAnonKey.includes('sua_chave') && !supabaseAnonKey.includes('your-actual-anon-key')

if (!supabaseUrl || !supabaseAnonKey || !isValidUrl || !isValidKey) {
  const errorMsg = `
ERRO: Variáveis de ambiente do Supabase não configuradas!

Para corrigir:
1. Crie um arquivo .env na raiz do projeto
2. Acesse seu projeto Supabase → Settings → API
3. Copie o Project URL e anon public key
4. Adicione no .env:
   VITE_SUPABASE_URL=https://seu-projeto-id.supabase.co
   VITE_SUPABASE_ANON_KEY=sua_chave_anon_real_aqui
5. Reinicie o servidor (npm run dev)

IMPORTANTE: Substitua os valores de exemplo pelos valores reais do seu projeto!

Valores atuais:
VITE_SUPABASE_URL: ${supabaseUrl || 'AUSENTE'} ${!isValidUrl ? '(PLACEHOLDER DETECTADO)' : ''}
VITE_SUPABASE_ANON_KEY: ${supabaseAnonKey ? 'PRESENTE' : 'AUSENTE'} ${!isValidKey ? '(PLACEHOLDER DETECTADO)' : ''}
  `
  console.error(errorMsg)
  alert(errorMsg)
  throw new Error('Configuração do Supabase necessária')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Tipos para as configurações da aplicação
export interface AppConfig {
  id: string
  weather_api_key: string
  weather_api_provider: string
  admin_email: string
  admin_name: string
  company_name: string
  alert_temperature_min: number
  alert_temperature_max: number
  alert_humidity_min: number
  alert_humidity_max: number
  created_at: string
  updated_at: string
}

// Tipos para dados de sensores
export interface SensorReading {
  value: number
  timestamp: string
  dispositivo: number
}

export interface SensorData {
  sensor_id: number
  sensor_name: string
  sensor_type: string
  grupo_id: number
  grupo_name: string
  latest_value: number
  latest_timestamp: string
  readings: SensorReading[]
}

export interface SensorMetrics {
  temperature: {
    current: number
    average: number
    min: number
    max: number
    readings: SensorReading[]
  }
  humidity: {
    current: number
    average: number
    min: number
    max: number
    readings: SensorReading[]
  }
  water: {
    current: number
    average: number
    min: number
    max: number
    readings: SensorReading[]
  }
  energy: {
    current: number
    average: number
    min: number
    max: number
    readings: SensorReading[]
  }
  feed: {
    current: number
    average: number
    min: number
    max: number
    readings: SensorReading[]
  }
  weight: {
    current: number
    average: number
    min: number
    max: number
    readings: SensorReading[]
  }
}

// Tipos para dados meteorológicos
export interface WeatherData {
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

// Funções para chamar as Edge Functions
export const sensorAPI = {
  async getSensorData(): Promise<{ sensors: Record<string, SensorData>, metrics: SensorMetrics }> {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      throw new Error('User not authenticated')
    }

    try {
      const response = await fetch(`${supabaseUrl}/functions/v1/get-sensor-data`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Edge Function HTTP Error:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        })
        throw new Error(`Edge Function error (${response.status}): ${errorText}`)
      }

      const result = await response.json()
      
      if (!result.success) {
        console.error('Edge Function returned error:', result)
        throw new Error(result.error || 'Failed to fetch sensor data')
      }

      return result.data
    } catch (fetchError) {
      console.error('Fetch error details:', {
        message: fetchError.message,
        name: fetchError.name,
        stack: fetchError.stack,
        url: `${supabaseUrl}/functions/v1/get-sensor-data`
      })
      
      if (fetchError.name === 'TypeError' && fetchError.message === 'Failed to fetch') {
        throw new Error('Não foi possível conectar com o servidor. Verifique se as Edge Functions estão configuradas corretamente no Supabase.')
      }
      
      throw fetchError
    }
  }
}

export const weatherAPI = {
  async getWeatherData(lat?: string, lon?: string, city?: string): Promise<{ current: WeatherData, forecast: any[] }> {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      throw new Error('User not authenticated')
    }

    const params = new URLSearchParams()
    if (lat) params.append('lat', lat)
    if (lon) params.append('lon', lon)
    if (city) params.append('city', city)

    const response = await fetch(`${supabaseUrl}/functions/v1/get-weather-data?${params}`, {
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch weather data')
    }

    return result.data
  }
}

export const configAPI = {
  async getAppConfigs(): Promise<AppConfig> {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      throw new Error('User not authenticated')
    }

    const response = await fetch(`${supabaseUrl}/functions/v1/get-app-configs`, {
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch app configs')
    }

    return result.data
  },

  async updateAppConfigs(configs: Partial<AppConfig>): Promise<AppConfig> {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      throw new Error('User not authenticated')
    }

    const response = await fetch(`${supabaseUrl}/functions/v1/update-app-configs`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(configs)
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to update app configs')
    }

    return result.data
  },

  async testDatabaseConnection(): Promise<{
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
  }> {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      throw new Error('User not authenticated')
    }

    const response = await fetch(`${supabaseUrl}/functions/v1/test-db-connection`, {
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorData = await response.json()
      return errorData
    }

    const result = await response.json()
    return result
  }
}

// Tipos para metadados de dados brutos
export interface RawDataMeta {
  totalRows: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  tableName: string;
  filter: string;
  sortBy: string | null;
  sortOrder: 'ASC' | 'DESC';
}

// Funções para chamar a Edge Function de dados brutos
export const rawDataAPI = {
  /**
   * Busca dados brutos de uma tabela específica do PostgreSQL externo.
   * Suporta paginação, filtragem e ordenação.
   * @param tableName O nome da tabela a ser consultada (ex: 'informacoes', 'sensor', 'grupo').
   * @param options Opções de paginação, filtro e ordenação.
   * @returns Uma Promise que resolve para um objeto contendo os dados e metadados da consulta.
   */
  async getRawData(
    tableName: string,
    options?: {
      page?: number;
      pageSize?: number;
      filter?: string;
      sortBy?: string;
      sortOrder?: 'ASC' | 'DESC';
    }
  ): Promise<{ data: any[]; meta: RawDataMeta }> {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      throw new Error('User not authenticated');
    }

    const params = new URLSearchParams();
    params.append('tableName', tableName);
    if (options?.page) params.append('page', options.page.toString());
    if (options?.pageSize) params.append('pageSize', options.pageSize.toString());
    if (options?.filter) params.append('filter', options.filter);
    if (options?.sortBy) params.append('sortBy', options.sortBy);
    if (options?.sortOrder) params.append('sortOrder', options.sortOrder);

    const response = await fetch(`${supabaseUrl}/functions/v1/get-raw-data?${params}`, {
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Edge Function HTTP Error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      throw new Error(`Edge Function error (${response.status}): ${errorText}`);
    }

    const result = await response.json();

    if (!result.success) {
      console.error('Edge Function returned error:', result);
      throw new Error(result.error || 'Failed to fetch raw data');
    }

    return result;
  },
};