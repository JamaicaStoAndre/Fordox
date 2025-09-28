/**
 * Página principal dos indicadores históricos
 * 
 * Esta página mostra:
 * - Grid com cards de todos os indicadores disponíveis
 * - Cada card é clicável e leva para página detalhada
 * - Informações sobre origem dos dados (reais ou simulados)
 * - Layout responsivo que funciona bem no celular
 * 
 * Como usar:
 * Esta página é acessada pela rota /indicadores
 * 
 * Quando alterar:
 * - Se quiser adicionar novos indicadores
 * - Se quiser mudar o layout da página
 */

import React from 'react';
import { Thermometer, Droplets, Zap, Wheat, Scale, Fuel } from 'lucide-react';
import IndicatorCard from './IndicatorCard';

/**
 * Lista de todos os indicadores disponíveis no sistema
 * Cada indicador tem suas configurações específicas
 */
const indicators = [
  {
    title: 'Temperatura',
    type: 'temperature',
    unit: '°C',
    icon: Thermometer,
    color: '#ef4444', // Vermelho
    description: 'Temperatura ambiente dos galpões'
  },
  {
    title: 'Umidade',
    type: 'humidity', 
    unit: '%',
    icon: Droplets,
    color: '#3b82f6', // Azul
    description: 'Umidade relativa do ar'
  },
  {
    title: 'Consumo de Água',
    type: 'water',
    unit: 'L',
    icon: Droplets,
    color: '#06b6d4', // Azul claro
    description: 'Volume de água consumido'
  },
  {
    title: 'Consumo de Energia',
    type: 'energy',
    unit: 'kW',
    icon: Zap,
    color: '#f59e0b', // Amarelo
    description: 'Energia elétrica consumida'
  },
  {
    title: 'Consumo de Ração',
    type: 'feed',
    unit: 'kg',
    icon: Wheat,
    color: '#84cc16', // Verde claro
    description: 'Quantidade de ração fornecida'
  },
  {
    title: 'Peso dos Animais',
    type: 'weight',
    unit: 'kg',
    icon: Scale,
    color: '#8b5cf6', // Roxo
    description: 'Peso médio do rebanho'
  }
];

/**
 * Componente principal da página de indicadores
 */
const IndicatorsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Cabeçalho da página */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Indicadores Históricos
            </h1>
            <p className="text-gray-600 mt-2">
              Acompanhe o histórico e tendências dos principais indicadores do sistema
            </p>
          </div>
          
          {/* Indicador de status geral */}
          <div className="text-right">
            <p className="text-sm text-gray-500">Status do Sistema</p>
            <div className="flex items-center space-x-2 mt-1">
              <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
              <span className="font-medium text-green-700">Monitorando</span>
            </div>
          </div>
        </div>
      </div>

      {/* Informações sobre os dados */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 text-sm font-bold">i</span>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-blue-900 mb-1">
              Sobre os Dados
            </h3>
            <p className="text-sm text-blue-800">
              Os cards mostram <strong>"Dados reais"</strong> quando conectados ao banco de dados 
              ou <strong>"Dados simulados"</strong> quando não há conexão. 
              Clique em qualquer card para ver o histórico completo.
            </p>
          </div>
        </div>
      </div>

      {/* Grid de indicadores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {indicators.map((indicator) => (
          <IndicatorCard
            key={indicator.type}
            title={indicator.title}
            type={indicator.type}
            unit={indicator.unit}
            icon={indicator.icon}
            color={indicator.color}
          />
        ))}
      </div>

      {/* Informações adicionais */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Como Interpretar os Gráficos
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Dados Reais</h4>
            <p className="text-sm text-gray-600">
              Informações coletadas diretamente dos sensores instalados nos galpões. 
              Atualizados automaticamente a cada 5 minutos.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Dados Simulados</h4>
            <p className="text-sm text-gray-600">
              Valores gerados automaticamente quando não há conexão com os sensores. 
              Úteis para demonstração e testes do sistema.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IndicatorsPage;