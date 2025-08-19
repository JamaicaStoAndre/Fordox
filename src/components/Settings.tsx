import React, { useState, useEffect } from 'react';
import { Save, Key, Database, User, AlertTriangle, CheckCircle, Loader, Wifi, WifiOff } from 'lucide-react';
import { configAPI, AppConfig } from '../lib/supabase';

const Settings: React.FC = () => {
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionResult, setConnectionResult] = useState<{
    success: boolean
    message: string
    details: any
  } | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const [formData, setFormData] = useState({
    weather_api_key: '',
    weather_api_provider: 'openweathermap',
    admin_name: '',
    company_name: 'Fordox',
    alert_temperature_min: 18,
    alert_temperature_max: 28,
    alert_humidity_min: 40,
    alert_humidity_max: 80
  });

  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    try {
      setLoading(true);
      const configs = await configAPI.getAppConfigs();
      setConfig(configs);
      setFormData({
        weather_api_key: configs.weather_api_key || '',
        weather_api_provider: configs.weather_api_provider || 'openweathermap',
        admin_name: configs.admin_name || '',
        company_name: configs.company_name || 'Fordox',
        alert_temperature_min: configs.alert_temperature_min || 18,
        alert_temperature_max: configs.alert_temperature_max || 28,
        alert_humidity_min: configs.alert_humidity_min || 40,
        alert_humidity_max: configs.alert_humidity_max || 80
      });
    } catch (error) {
      console.error('Error loading configs:', error);
      setMessage({ type: 'error', text: 'Erro ao carregar configurações' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setMessage(null);
      
      await configAPI.updateAppConfigs(formData);
      
      setMessage({ type: 'success', text: 'Configurações salvas com sucesso!' });
      
      // Recarregar configurações
      await loadConfigs();
    } catch (error) {
      console.error('Error saving configs:', error);
      setMessage({ type: 'error', text: 'Erro ao salvar configurações' });
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name.includes('alert_') ? parseFloat(value) || 0 : value
    }));
  };

  const testDatabaseConnection = async () => {
    try {
      setTestingConnection(true);
      setConnectionResult(null);
      setMessage(null);
      
      const result = await configAPI.testDatabaseConnection();
      setConnectionResult(result);
      
      if (result.success) {
        setMessage({ type: 'success', text: 'Conexão com banco de dados testada com sucesso!' });
      } else {
        setMessage({ type: 'error', text: `Falha na conexão: ${result.message}` });
      }
    } catch (error) {
      console.error('Error testing database connection:', error);
      setMessage({ type: 'error', text: 'Erro ao testar conexão com banco de dados' });
      setConnectionResult({
        success: false,
        message: 'Erro interno',
        details: { error: error.message }
      });
    } finally {
      setTestingConnection(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="flex items-center space-x-3">
          <Loader className="h-6 w-6 animate-spin text-green-600" />
          <span className="text-gray-600">Carregando configurações...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Configurações do Sistema</h2>
          <div className="flex items-center space-x-2">
            {config && (
              <span className="text-sm text-gray-500">
                Última atualização: {new Date(config.updated_at).toLocaleString('pt-BR')}
              </span>
            )}
          </div>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center space-x-3 ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-800' 
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="h-5 w-5" />
            ) : (
              <AlertTriangle className="h-5 w-5" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Configurações do Banco de Dados */}
          <div className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Database className="h-6 w-6 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900">Conexão com Banco de Dados</h3>
            </div>
            
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Teste a conectividade com o banco de dados PostgreSQL externo onde estão armazenados os dados dos sensores.
              </p>
              
              <div className="flex items-center space-x-4">
                <button
                  type="button"
                  onClick={testDatabaseConnection}
                  disabled={testingConnection}
                  className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors"
                >
                  {testingConnection ? (
                    <Loader className="h-4 w-4 animate-spin" />
                  ) : (
                    <Database className="h-4 w-4" />
                  )}
                  <span>{testingConnection ? 'Testando...' : 'Testar Conexão'}</span>
                </button>
              </div>
              
              {connectionResult && (
                <div className={`p-4 rounded-lg border ${
                  connectionResult.success 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-red-50 border-red-200'
                }`}>
                  <div className="flex items-start space-x-3">
                    {connectionResult.success ? (
                      <Wifi className="h-5 w-5 text-green-600 mt-0.5" />
                    ) : (
                      <WifiOff className="h-5 w-5 text-red-600 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <h4 className={`font-medium ${
                        connectionResult.success ? 'text-green-800' : 'text-red-800'
                      }`}>
                        {connectionResult.success ? 'Conexão Bem-sucedida' : 'Falha na Conexão'}
                      </h4>
                      <p className={`text-sm mt-1 ${
                        connectionResult.success ? 'text-green-700' : 'text-red-700'
                      }`}>
                        {connectionResult.message}
                      </p>
                      
                      {connectionResult.details && (
                        <div className="mt-3 text-xs space-y-1">
                          <div className="grid grid-cols-2 gap-2">
                            <span className="font-medium">Host:</span>
                            <span className="font-mono">{connectionResult.details.host}</span>
                            <span className="font-medium">Porta:</span>
                            <span className="font-mono">{connectionResult.details.port}</span>
                            <span className="font-medium">Banco:</span>
                            <span className="font-mono">{connectionResult.details.database}</span>
                            <span className="font-medium">Usuário:</span>
                            <span className="font-mono">{connectionResult.details.user}</span>
                            {connectionResult.details.connection_time && (
                              <>
                                <span className="font-medium">Tempo:</span>
                                <span className="font-mono">{connectionResult.details.connection_time}ms</span>
                              </>
                            )}
                          </div>
                          
                          {connectionResult.details.tables_found && connectionResult.details.tables_found.length > 0 && (
                            <div className="mt-2">
                              <span className="font-medium">Tabelas encontradas:</span>
                              <div className="mt-1 flex flex-wrap gap-1">
                                {connectionResult.details.tables_found.map((table: string) => (
                                  <span key={table} className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">
                                    {table}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {connectionResult.details.error && (
                            <div className="mt-2">
                              <span className="font-medium text-red-700">Erro:</span>
                              <p className="mt-1 font-mono text-red-600 bg-red-100 p-2 rounded text-xs">
                                {connectionResult.details.error}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Configurações da API Meteorológica */}
          <div className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Key className="h-6 w-6 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">API Meteorológica</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Provedor da API
                </label>
                <select
                  name="weather_api_provider"
                  value={formData.weather_api_provider}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="openweathermap">OpenWeatherMap</option>
                  <option value="weatherapi">WeatherAPI</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chave da API
                </label>
                <input
                  type="password"
                  name="weather_api_key"
                  value={formData.weather_api_key}
                  onChange={handleInputChange}
                  placeholder="Insira sua chave da API meteorológica"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>OpenWeatherMap:</strong> Obtenha sua chave gratuita em{' '}
                <a href="https://openweathermap.org/api" target="_blank" rel="noopener noreferrer" className="underline">
                  openweathermap.org/api
                </a>
              </p>
            </div>
          </div>

          {/* Configurações do Administrador */}
          <div className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <User className="h-6 w-6 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">Dados do Administrador</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome da Empresa
                </label>
                <input
                  type="text"
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleInputChange}
                  placeholder="Nome da sua empresa"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome do Administrador
                </label>
                <input
                  type="text"
                  name="admin_name"
                  value={formData.admin_name}
                  onChange={handleInputChange}
                  placeholder="Seu nome completo"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
            
            {config && (
              <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-sm text-gray-600">
                  <strong>Email:</strong> {config.admin_email}
                </p>
              </div>
            )}
          </div>

          {/* Configurações de Alertas */}
          <div className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <AlertTriangle className="h-6 w-6 text-orange-600" />
              <h3 className="text-lg font-semibold text-gray-900">Limites de Alertas</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-700 mb-3">Temperatura (°C)</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Mínima</label>
                    <input
                      type="number"
                      name="alert_temperature_min"
                      value={formData.alert_temperature_min}
                      onChange={handleInputChange}
                      step="0.1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Máxima</label>
                    <input
                      type="number"
                      name="alert_temperature_max"
                      value={formData.alert_temperature_max}
                      onChange={handleInputChange}
                      step="0.1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-700 mb-3">Umidade (%)</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Mínima</label>
                    <input
                      type="number"
                      name="alert_humidity_min"
                      value={formData.alert_humidity_min}
                      onChange={handleInputChange}
                      min="0"
                      max="100"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Máxima</label>
                    <input
                      type="number"
                      name="alert_humidity_max"
                      value={formData.alert_humidity_max}
                      onChange={handleInputChange}
                      min="0"
                      max="100"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Botão de Salvar */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2 transition-colors"
            >
              {saving ? (
                <Loader className="h-5 w-5 animate-spin" />
              ) : (
                <Save className="h-5 w-5" />
              )}
              <span>{saving ? 'Salvando...' : 'Salvar Configurações'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings;