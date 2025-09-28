/**
 * Componente que mostra um gráfico pequeno com dados da semana
 * 
 * Este componente é usado dentro dos cards de indicadores para mostrar:
 * - Uma linha com os valores dos últimos 7 dias
 * - Cores diferentes dependendo do tipo de dado
 * - Animação suave quando os dados mudam
 * 
 * Como usar:
 * <WeeklyChart data={dadosDaSemana} color="#10b981" />
 * 
 * Quando alterar:
 * - Se quiser mudar o estilo do gráfico
 * - Se quiser adicionar mais informações no tooltip
 */

import React from 'react';
import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts';

// Define como cada ponto de dados deve ser estruturado
interface DataPoint {
  date: string;     // Data no formato "DD/MM"
  value: number;    // Valor do sensor
  timestamp: string; // Data completa
}

// Define as propriedades que o componente recebe
interface WeeklyChartProps {
  data: DataPoint[];  // Lista com dados dos últimos 7 dias
  color?: string;     // Cor da linha do gráfico (opcional)
  height?: number;    // Altura do gráfico (opcional)
}

/**
 * Componente de tooltip personalizado para mostrar informações quando passar o mouse
 */
const CustomTooltip = ({ active, payload, label }: any) => {
  // Só mostra o tooltip se o mouse estiver sobre um ponto
  if (active && payload && payload.length) {
    const value = payload[0].value;
    return (
      <div className="bg-white p-2 border border-gray-200 rounded-lg shadow-md">
        <p className="text-sm font-medium text-gray-900">
          {label}: {value}
        </p>
      </div>
    );
  }
  return null;
};

/**
 * Componente principal do gráfico semanal
 * 
 * @param data - Dados para plotar no gráfico
 * @param color - Cor da linha (padrão: verde)
 * @param height - Altura do gráfico (padrão: 60px)
 */
const WeeklyChart: React.FC<WeeklyChartProps> = ({ 
  data, 
  color = '#10b981', 
  height = 60 
}) => {
  // Se não tem dados, mostra uma linha reta
  if (!data || data.length === 0) {
    return (
      <div 
        className="w-full bg-gray-100 rounded flex items-center justify-center"
        style={{ height }}
      >
        <span className="text-xs text-gray-400">Sem dados</span>
      </div>
    );
  }

  return (
    <div className="w-full" style={{ height }}>
      {/* 
        ResponsiveContainer faz o gráfico se ajustar ao tamanho do container
        LineChart cria o gráfico de linha
        Line define como a linha deve aparecer
      */}
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
          <Line
            type="monotone"           // Tipo de curva suave
            dataKey="value"           // Campo dos dados que contém o valor
            stroke={color}            // Cor da linha
            strokeWidth={2}           // Espessura da linha
            dot={false}               // Não mostra pontos na linha
            activeDot={{ 
              r: 4, 
              fill: color,
              stroke: '#fff',
              strokeWidth: 2 
            }}                        // Ponto que aparece quando passa o mouse
            animationDuration={1000}  // Duração da animação em milissegundos
          />
          {/* Tooltip que aparece quando passa o mouse sobre a linha */}
          <Tooltip content={<CustomTooltip />} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default WeeklyChart;