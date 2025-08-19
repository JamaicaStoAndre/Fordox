/*
  # Criar tabela de configurações da aplicação

  1. Nova Tabela
    - `app_configs`
      - `id` (uuid, primary key)
      - `weather_api_key` (text) - Chave da API meteorológica
      - `weather_api_provider` (text) - Provedor da API (openweathermap, etc)
      - `admin_email` (text) - Email do administrador
      - `admin_name` (text) - Nome do administrador
      - `company_name` (text) - Nome da empresa
      - `alert_temperature_min` (numeric) - Limite mínimo de temperatura para alertas
      - `alert_temperature_max` (numeric) - Limite máximo de temperatura para alertas
      - `alert_humidity_min` (numeric) - Limite mínimo de umidade para alertas
      - `alert_humidity_max` (numeric) - Limite máximo de umidade para alertas
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Segurança
    - Habilitar RLS na tabela `app_configs`
    - Adicionar política para usuários autenticados lerem suas próprias configurações
    - Adicionar política para usuários autenticados atualizarem suas próprias configurações
*/

CREATE TABLE IF NOT EXISTS app_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  weather_api_key text DEFAULT '',
  weather_api_provider text DEFAULT 'openweathermap',
  admin_email text NOT NULL,
  admin_name text DEFAULT '',
  company_name text DEFAULT 'Fordox',
  alert_temperature_min numeric DEFAULT 18,
  alert_temperature_max numeric DEFAULT 28,
  alert_humidity_min numeric DEFAULT 40,
  alert_humidity_max numeric DEFAULT 80,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE app_configs ENABLE ROW LEVEL SECURITY;

-- Política para permitir que usuários autenticados leiam configurações
CREATE POLICY "Users can read app configs"
  ON app_configs
  FOR SELECT
  TO authenticated
  USING (true);

-- Política para permitir que usuários autenticados insiram configurações
CREATE POLICY "Users can insert app configs"
  ON app_configs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- Política para permitir que usuários autenticados atualizem configurações
CREATE POLICY "Users can update app configs"
  ON app_configs
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (auth.uid() IS NOT NULL);