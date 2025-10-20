import React from 'react';
import { sensorAPI } from '../lib/supabase';
import { useGrupo } from '../contexts/GrupoContext';

const EnvironmentChart: React.FC = () => {
  const { grupoSelecionado } = useGrupo();
  const [chartData, setChartData] = React.useState([
    { time: '00:00', temp: 21.2, humidity: 65 },
    { time: '04:00', temp: 20.8, humidity: 68 },
    { time: '08:00', temp: 22.1, humidity: 62 },
    { time: '12:00', temp: 24.5, humidity: 58 },
    { time: '16:00', temp: 25.2, humidity: 55 },
    { time: '20:00', temp: 23.1, humidity: 61 },
  ]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    loadSensorHistory();
  }, [grupoSelecionado]);

  const loadSensorHistory = async () => {
    try {
      setLoading(true);
      const data = await sensorAPI.getSensorData(grupoSelecionado?.id);
      
      // If we have real sensor readings, use them for the chart
      if (data.metrics.temperature.readings && data.metrics.temperature.readings.length > 0) {
        const tempReadings = data.metrics.temperature.readings.slice(0, 6);
        const humidityReadings = data.metrics.humidity.readings.slice(0, 6);
        
        const newChartData = tempReadings.map((reading, index) => {
          const time = new Date(reading.timestamp).toLocaleTimeString('pt-BR', { 
            hour: '2-digit', 
            minute: '2-digit' 
          });
          const humidity = humidityReadings[index]?.value || 65;
          
          return {
            time,
            temp: reading.value,
            humidity
          };
        });
        
        setChartData(newChartData);
      }
    } catch (error) {
      console.error('Error loading sensor history:', error);
      // Keep using simulated data if real data fails
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Condições Ambientais (24h)</h3>
          {loading && (
            <p className="text-sm text-blue-600">Carregando dados históricos...</p>
          )}
        </div>
        <div className="flex space-x-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-gray-600">Temperatura</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-gray-600">Umidade</span>
          </div>
        </div>
      </div>

      <div className="relative h-64">
        <svg className="w-full h-full" viewBox="0 0 400 200">
          {/* Grid lines */}
          {[...Array(5)].map((_, i) => (
            <line
              key={i}
              x1="40"
              y1={40 + i * 30}
              x2="380"
              y2={40 + i * 30}
              stroke="#f3f4f6"
              strokeWidth="1"
            />
          ))}
          
          {/* Temperature line */}
          <polyline
            fill="none"
            stroke="#ef4444"
            strokeWidth="3"
            points={chartData.map((d, i) => `${60 + i * 55},${170 - (d.temp - 20) * 8}`).join(' ')}
          />
          
          {/* Humidity line */}
          <polyline
            fill="none"
            stroke="#3b82f6"
            strokeWidth="3"
            points={chartData.map((d, i) => `${60 + i * 55},${170 - (d.humidity - 50) * 3}`).join(' ')}
          />
          
          {/* Data points */}
          {chartData.map((d, i) => (
            <g key={i}>
              <circle
                cx={60 + i * 55}
                cy={170 - (d.temp - 20) * 8}
                r="4"
                fill="#ef4444"
              />
              <circle
                cx={60 + i * 55}
                cy={170 - (d.humidity - 50) * 3}
                r="4"
                fill="#3b82f6"
              />
            </g>
          ))}
          
          {/* Time labels */}
          {chartData.map((d, i) => (
            <text
              key={i}
              x={60 + i * 55}
              y="195"
              textAnchor="middle"
              className="text-xs fill-gray-500"
            >
              {d.time}
            </text>
          ))}
        </svg>
      </div>
    </div>
  );
};

export default EnvironmentChart;