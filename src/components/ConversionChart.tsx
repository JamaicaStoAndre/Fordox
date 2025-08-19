import React from 'react';

const ConversionChart: React.FC = () => {
  const data = [
    { week: 'Sem 1', conversion: 1.8, target: 2.0 },
    { week: 'Sem 2', conversion: 1.9, target: 2.0 },
    { week: 'Sem 3', conversion: 2.1, target: 2.0 },
    { week: 'Sem 4', conversion: 2.0, target: 2.0 },
    { week: 'Sem 5', conversion: 2.2, target: 2.0 },
    { week: 'Sem 6', conversion: 2.1, target: 2.0 },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Conversão Alimentar</h3>
        <div className="flex space-x-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-gray-600">Realizado</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
            <span className="text-gray-600">Meta</span>
          </div>
        </div>
      </div>

      <div className="relative h-64">
        <svg className="w-full h-full" viewBox="0 0 400 200">
          {/* Grid lines */}
          {[...Array(6)].map((_, i) => (
            <line
              key={i}
              x1="40"
              y1={30 + i * 25}
              x2="380"
              y2={30 + i * 25}
              stroke="#f3f4f6"
              strokeWidth="1"
            />
          ))}
          
          {/* Bars for actual conversion */}
          {data.map((d, i) => (
            <g key={i}>
              <rect
                x={60 + i * 50}
                y={170 - (d.conversion - 1.5) * 80}
                width="15"
                height={(d.conversion - 1.5) * 80}
                fill="#10b981"
                rx="2"
              />
              <rect
                x={80 + i * 50}
                y={170 - (d.target - 1.5) * 80}
                width="15"
                height={(d.target - 1.5) * 80}
                fill="#9ca3af"
                rx="2"
              />
              <text
                x={75 + i * 50}
                y="190"
                textAnchor="middle"
                className="text-xs fill-gray-500"
              >
                {d.week}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
};

export default ConversionChart;