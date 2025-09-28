/**
 * Card interativo que mostra um indicador com gráfico semanal
 * 
 * Este componente é usado na página de indicadores para mostrar:
 * - Nome do indicador (ex: "Temperatura")
 * - Valor atual grande e destacado
 * - Gráfico pequeno com dados da semana
 * - Se os dados são reais ou simulados
 * - É clicável para abrir página detalhada
 * 
 * Como usar:
 * <IndicatorCard 
 *   title="Temperatura" 
 *   type="temperature" 
 *   unit="°C" 
 *   icon={Thermometer}
 *   color="#ef4444"
 * />
 * 
 * Quando alterar:
 * - Se quiser mudar o layout do card
 * - Se quiser adicionar mais informações
 */

import React from 'react';
import { Video as LucideIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import WeeklyChart from './WeeklyChart';
import { useIndicadorData } from '../hooks/useIndicadorData';

// Define as propriedades que o componente recebe
interface IndicatorCardProps {
  title: string;        // Nome do indicador (ex: "Temperatura")
  type: string;         // Tipo para buscar dados (ex: "temperature")
  unit: string;         // Unidade de medida (ex: "°C")
  icon: LucideIcon;     // Ícone do Lucide React
  color: string;        // Cor principal do card
}

/**
 * Componente principal do card de indicador
 * 
 * @param title - Nome que aparece no card
 * @param type - Tipo usado para buscar dados do banco
 * @param unit - Unidade de medida
 * @param icon - Ícone que aparece no card
 * @param color - Cor do ícone e gráfico
 */
const IndicatorCard: React.FC<IndicatorCardProps> = ({
  title,
  type,
  unit,
  icon: Icon,
  color
}) => {
  // Hook para navegar entre páginas
  const navigate = useNavigate();
  
  // Hook personalizado que busca os dados do indicador
  const { data, current, loading, isSimulated, error } = useIndicadorData(type);

  /**
   * Função chamada quando o usuário clica no card
   * Navega para a página detalhada do indicador
   */
  const handleClick = () => {
    navigate(`/indicadores/${type}`);
  };

  /**
   * Determina qual mensagem mostrar sobre a origem dos dados
   */
  const getDataSourceMessage = () => {
    if (loading) return 'Carregando...';
    if (error) return 'Erro ao carregar';
    return isSimulated ? 'Dados simulados' : 'Dados reais';
  };

  /**
   * Determina a cor da mensagem baseada no status
   */
  const getDataSourceColor = () => {
    if (loading) return 'text-blue-600';
    if (error) return 'text-red-600';
    return isSimulated ? 'text-orange-600' : 'text-green-600';
  };

  return (
    <div
      onClick={handleClick}
      className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all duration-200 cursor-pointer border border-gray-100 hover:border-gray-200"
    >
      {/* Cabeçalho do card com ícone e título */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          {/* Ícone com cor personalizada */}
          <div 
            className="p-2 rounded-lg"
            style={{ backgroundColor: `${color}20`, color }}
          >
            <Icon className="h-5 w-5" />
          </div>
          <h3 className="text-sm font-medium text-gray-700">{title}</h3>
        </div>
        
        {/* Indicador de status dos dados */}
        <span className={`text-xs font-medium ${getDataSourceColor()}`}>
          {getDataSourceMessage()}
        </span>
      </div>

      {/* Valor atual grande */}
      <div className="mb-4">
        {loading ? (
          // Mostra animação de carregamento
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-20 mb-2"></div>
          </div>
        ) : (
          <p className="text-2xl font-bold text-gray-900">
            {current.toFixed(1)}{unit}
          </p>
        )}
      </div>

      {/* Gráfico semanal */}
      <div className="mb-3">
        {loading ? (
          // Mostra placeholder enquanto carrega
          <div className="w-full h-16 bg-gray-100 rounded animate-pulse"></div>
        ) : (
          <WeeklyChart data={data} color={color} height={64} />
        )}
      </div>

      {/* Texto explicativo */}
      <p className="text-xs text-gray-500">
        Últimos 7 dias • Clique para ver detalhes
      </p>
    </div>
  );
};

export default IndicatorCard;