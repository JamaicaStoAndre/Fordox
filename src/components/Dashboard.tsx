import React, { useState, useEffect } from 'react';
import { Thermometer, Droplets, Wind, Activity, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { sensorAPI } from '../lib/supabase';
import MetricCard from './MetricCard';
import AlertBanner from './AlertBanner';
import ConversionChart from './ConversionChart';
import EnvironmentChart from './EnvironmentChart';

interface DashboardProps {
  userRole: 'producer' | 'slaughterhouse';
}

const Dashboard: React.FC<DashboardProps> = ({ userRole }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [sensorDataLoading, setSensorDataLoading] = useState(true);
  const [sensorDataError, setSensorDataError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState({
    temperature: 22.5,
    humidity: 68,
    feedConversion: 2.1,
    mortality: 0.8,
    averageWeight: 45.2,
    water: 0,
    energy: 0,
    feed: 0,
    weight: 0
  });

  useEffect(() => {
    // Load real sensor data on component mount
    loadSensorData();
    
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      // Reload sensor data every 30 seconds
      loadSensorData();
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const loadSensorData = async () => {
    try {
      setSensorDataError(null);
      console.log('Iniciando carregamento dos dados dos sensores...')
      const data = await sensorAPI.getSensorData();
      
      // Update metrics with real sensor data
      setMetrics(prev => ({
        ...prev,
        temperature: data.metrics?.temperature?.current || prev.temperature,
        humidity: data.metrics?.humidity?.current || prev.humidity,
        water: data.metrics?.water?.current || prev.water,
        energy: data.metrics?.energy?.current || prev.energy,
        feed: data.metrics?.feed?.current || prev.feed,
        weight: data.metrics?.weight?.current || prev.weight,
        // Keep simulated values for animal-specific metrics
        feedConversion: 2.1 + (Math.random() - 0.5) * 0.2,
      }));
      
      setSensorDataLoading(false);
    } catch (error) {
      console.error('Erro ao carregar dados dos sensores:', {
        message: error.message,
        name: error.name,
        stack: error.stack
      })
      
      setSensorDataError(`Erro: ${error.message}`)
      setSensorDataLoading(false);
      
      // Continue with simulated data if sensor data fails
      setMetrics(prev => ({
        ...prev,
        temperature: 22.5 + (Math.random() - 0.5) * 2,
        humidity: 68 + (Math.random() - 0.5) * 8,
        water: 150 + (Math.random() - 0.5) * 20,
        energy: 12.5 + (Math.random() - 0.5) * 2,
        feed: 85 + (Math.random() - 0.5) * 10,
        weight: 450 + (Math.random() - 0.5) * 50,
        feedConversion: 2.1 + (Math.random() - 0.5) * 0.2,
      }));
    }
  };
  const alerts = [
    {
      id: 1,
      type: 'warning' as const,
      message: 'Temperatura acima do ideal no Galpão B (24.8°C)',
      time: '2 min atrás'
    },
    {
      id: 2,
      type: 'info' as const,
      message: 'Umidade estabilizada após ajuste automático',
      time: '15 min atrás'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header with real-time info */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {userRole === 'producer' ? 'Granja São João' : 'Frigorífico Central'}
            </h1>
            <p className="text-gray-600 mt-1">
              Última atualização: {currentTime.toLocaleTimeString('pt-BR')}
            </p>
            {sensorDataLoading && (
              <p className="text-blue-600 text-sm mt-1">
                Carregando dados dos sensores...
              </p>
            )}
            {sensorDataError && (
              <p className="text-red-600 text-sm mt-1">
                Erro ao carregar sensores: {sensorDataError}
              </p>
            )}
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Status do Sistema</p>
            <div className="flex items-center space-x-2 mt-1">
              <div className={`w-3 h-3 rounded-full animate-pulse ${
                sensorDataError ? 'bg-red-500' : sensorDataLoading ? 'bg-yellow-500' : 'bg-green-500'
              }`}></div>
              <span className={`font-medium ${
                sensorDataError ? 'text-red-700' : sensorDataLoading ? 'text-yellow-700' : 'text-green-700'
              }`}>
                {sensorDataError ? 'Erro' : sensorDataLoading ? 'Carregando' : 'Monitorando'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts Banner */}
      {alerts.length > 0 && (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <AlertBanner key={alert.id} alert={alert} />
          ))}
        </div>
      )}

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <MetricCard
          title="Temperatura Média"
          value={`${metrics.temperature.toFixed(1)}°C`}
          icon={Thermometer}
          status={metrics.temperature > 24 ? 'warning' : 'normal'}
          change={sensorDataError ? "Dados simulados" : "Dados reais"}
        />
        <MetricCard
          title="Umidade Relativa"
          value={`${metrics.humidity.toFixed(0)}%`}
          icon={Droplets}
          status={metrics.humidity > 75 ? 'warning' : 'normal'}
          change={sensorDataError ? "Dados simulados" : "Dados reais"}
        />
        <MetricCard
          title="Consumo de Água"
          value={`${metrics.water.toFixed(1)}L`}
          icon={Droplets}
          status={metrics.water > 200 ? 'warning' : 'normal'}
          change={sensorDataError ? "Dados simulados" : "Dados reais"}
        />
        <MetricCard
          title="Consumo de Energia"
          value={`${metrics.energy.toFixed(1)}kW`}
          icon={Activity}
          status={metrics.energy > 15 ? 'warning' : 'normal'}
          change={sensorDataError ? "Dados simulados" : "Dados reais"}
        />
        <MetricCard
          title="Consumo de Ração"
          value={`${metrics.feed.toFixed(1)}kg`}
          icon={TrendingUp}
          status={metrics.feed > 100 ? 'warning' : 'normal'}
          change={sensorDataError ? "Dados simulados" : "Dados reais"}
        />
        <MetricCard
          title="Peso Geral"
          value={`${metrics.weight.toFixed(1)}kg`}
          icon={Wind}
          status="normal"
          change={sensorDataError ? "Dados simulados" : "Dados reais"}
        />
        
        {userRole === 'producer' && (
          <>
            <MetricCard
              title="Conversão Alimentar"
              value={`${metrics.feedConversion.toFixed(2)}:1`}
              icon={TrendingUp}
              status={metrics.feedConversion > 2.2 ? 'warning' : 'good'}
              change="Dados simulados"
            />
            <MetricCard
              title="Taxa de Mortalidade"
              value={`${metrics.mortality}%`}
              icon={Activity}
              status={metrics.mortality > 1 ? 'critical' : 'good'}
              change="Dados simulados"
            />
            <MetricCard
              title="Peso Médio"
              value={`${metrics.averageWeight.toFixed(1)}kg`}
              icon={TrendingUp}
              status="normal"
              change="Dados simulados"
            />
          </>
        )}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EnvironmentChart />
        {userRole === 'producer' && <ConversionChart />}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all duration-200">
            <AlertTriangle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-700">Gerar Relatório de Emergência</p>
          </button>
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all duration-200">
            <CheckCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-700">Validar Compliance</p>
          </button>
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-all duration-200">
            <TrendingUp className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-700">Análise Preditiva</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;