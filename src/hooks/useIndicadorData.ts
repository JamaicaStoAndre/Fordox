/**
 * Hook personalizado para buscar dados de indicadores do sistema
 * 
 * Este hook é responsável por:
 * - Conectar com o banco de dados para pegar informações dos sensores
 * - Se não conseguir dados reais, criar dados simulados para não quebrar a tela
 * - Organizar os dados de forma que os gráficos consigam entender
 * 
 * Como usar:
 * const { data, loading, isSimulated } = useIndicadorData('temperature')
 * 
 * Quando alterar:
 * - Se quiser adicionar novos tipos de sensores
 * - Se a estrutura do banco de dados mudar
 */

import { useState, useEffect } from 'react';
import { sensorAPI } from '../lib/supabase';
import { useGrupo } from '../contexts/GrupoContext';

// Define como os dados de cada indicador devem ser organizados
interface IndicadorDataPoint {
  date: string;        // Data no formato "DD/MM"
  value: number;       // Valor do sensor naquele dia
  timestamp: string;   // Data completa para ordenação
}

// Define o que o hook retorna para quem usar
interface IndicadorData {
  current: number;           // Valor mais recente
  data: IndicadorDataPoint[]; // Lista com dados dos últimos 7 dias
  loading: boolean;          // Se ainda está carregando
  isSimulated: boolean;      // Se os dados são reais ou simulados
  error: string | null;      // Se deu algum erro
}

/**
 * Hook que busca dados históricos de um indicador específico
 *
 * @param tipo - Tipo do indicador: 'temperature', 'humidity', 'water', etc.
 * @returns Objeto com dados, status de carregamento e se é simulado
 */
export const useIndicadorData = (tipo: string): IndicadorData => {
  const { grupoSelecionado } = useGrupo();

  // Estados para controlar os dados e status
  const [data, setData] = useState<IndicadorDataPoint[]>([]);
  const [current, setCurrent] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [isSimulated, setIsSimulated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    /**
     * Função que vai buscar os dados reais do banco
     * Se não conseguir, cria dados simulados
     */
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Tenta buscar dados reais do banco de dados para o grupo selecionado
        console.log(`Buscando dados reais para: ${tipo} do grupo: ${grupoSelecionado?.nome}`);
        const sensorData = await sensorAPI.getSensorData(grupoSelecionado?.id);
        
        // Verifica se conseguiu dados do tipo solicitado
        const metrics = sensorData.metrics;
        let realData = null;
        let currentValue = 0;
        
        // Mapeia o tipo solicitado para os dados do banco
        switch (tipo) {
          case 'temperature':
            realData = metrics.temperature?.readings;
            currentValue = metrics.temperature?.current || 0;
            break;
          case 'humidity':
            realData = metrics.humidity?.readings;
            currentValue = metrics.humidity?.current || 0;
            break;
          case 'water':
            realData = metrics.water?.readings;
            currentValue = metrics.water?.current || 0;
            break;
          case 'energy':
            realData = metrics.energy?.readings;
            currentValue = metrics.energy?.current || 0;
            break;
          case 'feed':
            realData = metrics.feed?.readings;
            currentValue = metrics.feed?.current || 0;
            break;
          case 'weight':
            realData = metrics.weight?.readings;
            currentValue = metrics.weight?.current || 0;
            break;
        }
        
        // Se conseguiu dados reais e eles não estão vazios
        if (realData && realData.length > 0) {
          console.log(`Dados reais encontrados para ${tipo}:`, realData.length, 'registros');
          
          // Organiza os dados reais para o gráfico
          const formattedData = realData
            .slice(0, 7) // Pega apenas os últimos 7 registros
            .reverse()   // Inverte para mostrar do mais antigo para o mais recente
            .map((reading: any) => {
              const date = new Date(reading.timestamp);
              return {
                date: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
                value: Number(reading.value.toFixed(1)),
                timestamp: reading.timestamp
              };
            });
          
          setData(formattedData);
          setCurrent(currentValue);
          setIsSimulated(false);
        } else {
          // Se não tem dados reais, cria dados simulados
          console.log(`Sem dados reais para ${tipo}, gerando dados simulados`);
          const simulatedData = generateSimulatedData(tipo);
          setData(simulatedData.data);
          setCurrent(simulatedData.current);
          setIsSimulated(true);
        }
        
      } catch (err) {
        // Se deu erro ao buscar dados reais, usa simulados
        console.error(`Erro ao buscar dados para ${tipo}:`, err);
        setError(err.message);
        
        const simulatedData = generateSimulatedData(tipo);
        setData(simulatedData.data);
        setCurrent(simulatedData.current);
        setIsSimulated(true);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [tipo, grupoSelecionado]); // Executa novamente se o tipo ou grupo mudar

  return { data, current, loading, isSimulated, error };
};

/**
 * Função que cria dados simulados quando não há dados reais
 * 
 * @param tipo - Tipo do indicador
 * @returns Dados simulados para os últimos 7 dias
 */
const generateSimulatedData = (tipo: string) => {
  // Define valores base para cada tipo de sensor
  const baseValues = {
    temperature: { base: 22, variation: 3, unit: '°C' },
    humidity: { base: 65, variation: 10, unit: '%' },
    water: { base: 150, variation: 30, unit: 'L' },
    energy: { base: 12, variation: 3, unit: 'kW' },
    feed: { base: 85, variation: 15, unit: 'kg' },
    weight: { base: 450, variation: 50, unit: 'kg' }
  };

  const config = baseValues[tipo] || baseValues.temperature;
  const data: IndicadorDataPoint[] = [];
  
  // Gera dados para os últimos 7 dias
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    // Cria um valor aleatório baseado no tipo
    const randomValue = config.base + (Math.random() - 0.5) * config.variation;
    
    data.push({
      date: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      value: Number(randomValue.toFixed(1)),
      timestamp: date.toISOString()
    });
  }
  
  // O valor atual é o último da lista
  const current = data[data.length - 1]?.value || config.base;
  
  return { data, current };
};