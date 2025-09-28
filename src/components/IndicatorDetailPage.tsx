/**
 * Página de detalhes de um indicador específico
 * 
 * Esta página mostra informações detalhadas sobre um indicador:
 * - Valor atual grande e destacado
 * - Gráfico expandido com dados históricos
 * - Estatísticas (mínimo, máximo, média)
 * - Status da conexão (dados reais ou simulados)
 * - Informações sobre o sensor
 * 
 * Como usar:
 * Acessada via rota /indicadores/:type (ex: /indicadores/temperature)
 * 
 * Quando alterar:
 * - Se quiser adicionar mais gráficos ou estatísticas
 * - Se quiser mudar o layout da página
 */

import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Thermometer, Droplets, Zap, Wheat, Scale, Fuel, TrendingUp, TrendingDown, Minus, AlertCircle, CheckCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useIndicadorData } from '../hooks/useIndicadorData';

/**
 * Configurações para cada tipo de indicador
 * Define ícone, cor, unidade e descrição para cada tipo
 */
const indicatorConfigs = {
  temperature: {
    title: 'Temperatura',
    icon: Thermometer,
    color: '#ef4444',
    unit: '°C',
    description: 'Temperatura ambiente dos galpões',
    idealRange: { min: 18, max: 25 },
    criticalRange: { min: 15, max: 30 }
  },
  humidity: {
    title: 'Umidade',
    icon: Droplets,
    color: '#3b82f6',
    unit: '%',
    description: 'Umidade relativa do ar',
    idealRange: { min: 50, max: 70 },
    criticalRange: { min: 30, max: 85 }
  },
  water: {
    title: 'Consumo de Água',
    icon: Droplets,
    color: '#06b6d4',
    unit: 'L',
    description: 'Volume de água consumido pelos animais',
    idealRange: { min: 100, max: 200 },
    criticalRange: { min: 50, max: 300 }
  },
  energy: {
    title: 'Consumo de Energia',
    icon: Zap,
    color: '#f59e0b',
    unit: 'kW',
    description: 'Energia elétrica consumida pelas instalações',
    idealRange: { min: 8, max: 15 },
    criticalRange: { min: 5, max: 20 }
  },
  feed: {
    title: 'Consumo de Ração',
    icon: Wheat,
    color: '#84cc16',
    unit: 'kg',
    description: 'Quantidade de ração fornecida aos animais',
    idealRange: { min: 70, max: 100 },
    criticalRange: { min: 50, max: 120 }
  },
  weight: {
    title: 'Peso dos Animais',
    icon: Scale,
    color: '#8b5cf6',
    unit: 'kg',
    description: 'Peso médio do rebanho',
    idealRange: { min: 400, max: 500 },
    criticalRange: { min: 300, max: 600 }
  }
};

/**
 * Componente principal da página de detalhes
 */
const IndicatorDetailPage: React.FC = () => {
  const { type } = useParams<{ type: string }>();
  const navigate = useNavigate();
  
  // Buscar dados do indicador usando o hook personalizado
  const { data, current, loading, isSimulated, error } = useIndicadorData(type || 'temperature');
  
  // Obter configuração do indicador atual
  const config = indicatorConfigs[type as keyof typeof indicatorConfigs] || indicatorConfigs.temperature;
  const Icon = config.icon;

  /**
   * Determina o status do valor atual baseado nas faixas ideais
   */
  const getValueStatus = (value: number) => {
    if (value >= config.idealRange.min && value <= config.idealRange.max) {
      return { status: 'ideal', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' };
    } else if (value >= config.criticalRange.min && value <= config.criticalRange.max) {
      return { status: 'attention', color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' };
    } else {
      return { status: 'critical', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' };
    }
  };

  /**
   * Calcula estatísticas dos dados históricos
   */
  const getStatistics = () => {
    if (!data || data.length === 0) return null;
    
    const values = data.map(d => d.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    
    return { min, max, avg };
  };

  /**
   * Determina a tendência baseada nos últimos valores
   */
  const getTrend = () => {
    if (!data || data.length < 2) return 'stable';
    
    const recent = data.slice(-3).map(d => d.value);
    const first = recent[0];
    const last = recent[recent.length - 1];
    const diff = last - first;
    
    if (Math.abs(diff) < 0.5) return 'stable';
    return diff > 0 ? 'up' : 'down';
  };

  const valueStatus = getValueStatus(current);
  const statistics = getStatistics();
  const trend = getTrend();

  /**
   * Componente de tooltip personalizado para o gráfico
   */
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const value = payload[0].value;
      const status = getValueStatus(value);
      
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-gray-900 mb-1">
            {label}
          </p>
          <p className={`text-lg font-bold ${status.color}`}>
            {value.toFixed(1)}{config.unit}
          </p>
          <p className="text-xs text-gray-500 capitalize">
            Status: {status.status === 'ideal' ? 'Ideal' : status.status === 'attention' ? 'Atenção' : 'Crítico'}
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dados do indicador...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Cabeçalho com botão voltar */}
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/indicadores')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Voltar aos Indicadores</span>
          </button>
        </div>

        {/* Título e informações principais */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div 
                className="p-3 rounded-lg"
                style={{ backgroundColor: `${config.color}20`, color: config.color }}
              >
                <Icon className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{config.title}</h1>
                <p className="text-gray-600 mt-1">{config.description}</p>
              </div>
            </div>
            
            {/* Status dos dados */}
            <div className="text-right">
              <div className="flex items-center space-x-2 mb-2">
                {isSimulated ? (
                  <AlertCircle className="h-5 w-5 text-orange-500" />
                ) : (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                )}
                <span className={`font-medium ${isSimulated ? 'text-orange-600' : 'text-green-600'}`}>
                  {isSimulated ? 'Dados Simulados' : 'Dados Reais'}
                </span>
              </div>
              <p className="text-sm text-gray-500">
                Última atualização: {new Date().toLocaleTimeString('pt-BR')}
              </p>
            </div>
          </div>

          {/* Valor atual e tendência */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className={`p-6 rounded-lg border-2 ${valueStatus.bg} ${valueStatus.border}`}>
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600 mb-2">Valor Atual</p>
                <p className={`text-4xl font-bold ${valueStatus.color} mb-2`}>
                  {current.toFixed(1)}{config.unit}
                </p>
                <div className="flex items-center justify-center space-x-2">
                  {trend === 'up' && <TrendingUp className="h-4 w-4 text-green-500" />}
                  {trend === 'down' && <TrendingDown className="h-4 w-4 text-red-500" />}
                  {trend === 'stable' && <Minus className="h-4 w-4 text-gray-500" />}
                  <span className="text-sm text-gray-600 capitalize">
                    {trend === 'up' ? 'Subindo' : trend === 'down' ? 'Descendo' : 'Estável'}
                  </span>
                </div>
              </div>
            </div>

            {/* Estatísticas */}
            {statistics && (
              <>
                <div className="p-6 bg-blue-50 border-2 border-blue-200 rounded-lg">
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-600 mb-2">Média (7 dias)</p>
                    <p className="text-2xl font-bold text-blue-600 mb-2">
                      {statistics.avg.toFixed(1)}{config.unit}
                    </p>
                    <p className="text-xs text-gray-500">
                      Baseado em {data.length} leituras
                    </p>
                  </div>
                </div>

                <div className="p-6 bg-gray-50 border-2 border-gray-200 rounded-lg">
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-600 mb-2">Variação</p>
                    <div className="space-y-1">
                      <p className="text-lg font-bold text-red-600">
                        Máx: {statistics.max.toFixed(1)}{config.unit}
                      </p>
                      <p className="text-lg font-bold text-blue-600">
                        Mín: {statistics.min.toFixed(1)}{config.unit}
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Gráfico expandido */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Histórico dos Últimos 7 Dias</h2>
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-gray-600">Faixa Ideal: {config.idealRange.min}-{config.idealRange.max}{config.unit}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-gray-600">Faixa Crítica: {config.criticalRange.min}-{config.criticalRange.max}{config.unit}</span>
              </div>
            </div>
          </div>

          {data && data.length > 0 ? (
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#666"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="#666"
                    fontSize={12}
                    domain={['dataMin - 2', 'dataMax + 2']}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  
                  {/* Linha principal */}
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke={config.color}
                    strokeWidth={3}
                    dot={{ fill: config.color, strokeWidth: 2, r: 6 }}
                    activeDot={{ r: 8, fill: config.color }}
                    animationDuration={1000}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-96 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <Icon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">Nenhum dado disponível</p>
                <p className="text-sm">Aguardando leituras dos sensores...</p>
              </div>
            </div>
          )}
        </div>

        {/* Informações adicionais */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Faixas de Referência</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                <span className="font-medium text-green-800">Faixa Ideal</span>
                <span className="text-green-700 font-mono">
                  {config.idealRange.min} - {config.idealRange.max}{config.unit}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <span className="font-medium text-orange-800">Faixa de Atenção</span>
                <span className="text-orange-700 font-mono">
                  Fora da faixa ideal
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                <span className="font-medium text-red-800">Faixa Crítica</span>
                <span className="text-red-700 font-mono">
                  &lt; {config.criticalRange.min} ou &gt; {config.criticalRange.max}{config.unit}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações do Sensor</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Tipo:</span>
                <span className="font-medium">{config.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Unidade:</span>
                <span className="font-medium font-mono">{config.unit}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className={`font-medium ${isSimulated ? 'text-orange-600' : 'text-green-600'}`}>
                  {isSimulated ? 'Simulado' : 'Conectado'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Leituras:</span>
                <span className="font-medium">{data.length} registros</span>
              </div>
              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800">
                    <strong>Erro:</strong> {error}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IndicatorDetailPage;