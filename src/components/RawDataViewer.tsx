/**
 * Componente para visualizar dados brutos de tabelas do PostgreSQL externo.
 *
 * Este componente permite ao usuário selecionar uma tabela, aplicar filtros de texto,
 * paginar os resultados e ordenar as colunas. Ele se conecta a uma Edge Function
 * do Supabase (`get-raw-data`) para buscar os dados.
 *
 * O que o componente faz:
 * - Exibe um dropdown para selecionar entre as tabelas permitidas ('informacoes', 'sensor', 'grupo').
 * - Possui um campo de busca para filtrar os dados em todas as colunas da tabela selecionada.
 * - Apresenta os dados em uma tabela HTML com cabeçalhos clicáveis para ordenação.
 * - Inclui controles de paginação para navegar entre os resultados.
 * - Mostra mensagens de carregamento e erro.
 *
 * Quando é necessário alterar algo:
 * - Se novas tabelas do PostgreSQL externo precisarem ser visualizadas, adicione-as à `allowedTables`.
 * - Se a lógica de paginação ou filtragem precisar ser mais complexa.
 * - Se o estilo da tabela ou dos controles precisar ser ajustado.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Table, Filter, Search, ChevronUp, ChevronDown, Loader, WifiOff, Database } from 'lucide-react';
import { rawDataAPI, RawDataMeta } from '../lib/supabase';

interface RawDataViewerProps {}

const RawDataViewer: React.FC<RawDataViewerProps> = () => {
  // Estado para a tabela atualmente selecionada no dropdown
  const [selectedTable, setSelectedTable] = useState('informacoes');
  // Estado para armazenar os dados brutos recebidos da API
  const [data, setData] = useState<any[]>([]);
  // Estado para armazenar metadados da paginação (total de linhas, páginas, etc.)
  const [meta, setMeta] = useState<RawDataMeta | null>(null);
  // Estado para indicar se os dados estão sendo carregados
  const [loading, setLoading] = useState(true);
  // Estado para armazenar mensagens de erro
  const [error, setError] = useState<string | null>(null);
  // Estado para o texto de filtro digitado pelo usuário
  const [filterText, setFilterText] = useState('');
  // Estado para a página atual da tabela
  const [currentPage, setCurrentPage] = useState(1);
  // Estado para a coluna pela qual os dados estão sendo ordenados
  const [sortBy, setSortBy] = useState<string | null>(null);
  // Estado para a ordem de ordenação (ASC ou DESC)
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('ASC');
  // Tamanho fixo da página (número de itens por página)
  const pageSize = 10;

  // Lista de tabelas permitidas para visualização
  const allowedTables = [
    { value: 'informacoes', label: 'Informações (Leituras com Descrições)' },
    { value: 'sensor', label: 'Sensores (Cadastro de Sensores)' },
    { value: 'grupo', label: 'Grupos (Localização dos Sensores)' }
  ];

  /**
   * Função para buscar os dados da API.
   * Usa useCallback para memorizar a função e evitar recriações desnecessárias.
   */
  const fetchData = useCallback(async () => {
    setLoading(true); // Inicia o estado de carregamento
    setError(null);   // Limpa qualquer erro anterior
    try {
      // Chama a API para buscar os dados brutos com os parâmetros atuais
      const result = await rawDataAPI.getRawData(selectedTable, {
        page: currentPage,
        pageSize,
        filter: filterText,
        sortBy,
        sortOrder,
      });
      setData(result.data); // Atualiza os dados
      setMeta(result.meta); // Atualiza os metadados
    } catch (err) {
      console.error('Error fetching raw data:', err);
      setError(err.message || 'Erro ao carregar dados brutos.'); // Define a mensagem de erro
    } finally {
      setLoading(false); // Finaliza o estado de carregamento
    }
  }, [selectedTable, currentPage, filterText, sortBy, sortOrder]); // Dependências do useCallback

  /**
   * useEffect para chamar fetchData sempre que as dependências mudarem.
   */
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /**
   * Lida com a mudança da tabela selecionada no dropdown.
   * Reseta a página, filtro e ordenação ao mudar de tabela.
   */
  const handleTableChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedTable(e.target.value);
    setCurrentPage(1); // Volta para a primeira página
    setFilterText(''); // Limpa o filtro
    setSortBy(null);   // Limpa a ordenação
    setSortOrder('ASC');
  };

  /**
   * Lida com a mudança do texto de filtro.
   * Reseta a página ao aplicar um novo filtro.
   */
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilterText(e.target.value);
    setCurrentPage(1); // Volta para a primeira página
  };

  /**
   * Lida com o clique no cabeçalho de uma coluna para ordenar.
   * Alterna a ordem (ASC/DESC) se a mesma coluna for clicada novamente.
   * Reseta a página ao mudar a ordenação.
   */
  const handleSort = (columnName: string) => {
    if (sortBy === columnName) {
      setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortBy(columnName);
      setSortOrder('ASC');
    }
    setCurrentPage(1); // Volta para a primeira página
  };

  /**
   * Renderiza o ícone de ordenação (seta para cima/baixo) ao lado do nome da coluna.
   */
  const renderSortIcon = (columnName: string) => {
    if (sortBy === columnName) {
      return sortOrder === 'ASC' ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />;
    }
    return null;
  };

  /**
   * Retorna os nomes das colunas com base nos dados recebidos.
   * Se não houver dados, retorna um array vazio.
   */
  const getColumnNames = () => {
    if (data.length === 0) return [];
    return Object.keys(data[0]);
  };

  /**
   * Formata o valor da célula para exibição
   */
  const formatCellValue = (value: any) => {
    if (value === null || value === undefined) {
      return <span className="text-gray-400 italic">null</span>;
    }
    
    // Se for uma data, formatar
    if (typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)) {
      try {
        const date = new Date(value);
        return (
          <span className="text-blue-600" title={value}>
            {date.toLocaleString('pt-BR')}
          </span>
        );
      } catch {
        return <span className="font-mono text-sm">{String(value)}</span>;
      }
    }
    
    // Se for número, destacar
    if (typeof value === 'number') {
      return <span className="text-green-600 font-medium">{value}</span>;
    }
    
    // Se for uma descrição de sensor, destacar
    if (typeof value === 'string' && (value.includes('Temperatura') || value.includes('Umidade') || value.includes('Sensor'))) {
      return <span className="text-purple-600 font-medium">{String(value)}</span>;
    }
    
    // Texto normal
    return <span className="text-gray-900">{String(value)}</span>;
  };

  /**
   * Obtém o nome amigável da tabela
   */
  const getTableDisplayName = () => {
    const table = allowedTables.find(t => t.value === selectedTable);
    return table ? table.label : selectedTable;
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho da página e seleção de tabela */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Visualizador de Dados Brutos</h2>
        </div>

        {/* Exibição de mensagens de erro */}
        {error && (
          <div className="mb-4 p-4 rounded-lg bg-red-50 border border-red-200 text-red-800 flex items-center space-x-3">
            <WifiOff className="h-5 w-5" />
            <span>{error}</span>
          </div>
        )}

        {/* Campo de filtro */}
        <div className="flex space-x-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder={`Filtrar dados em todas as colunas...`}
              value={filterText}
              onChange={handleFilterChange}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
            />
          </div>
          {filterText && (
            <button
              onClick={() => setFilterText('')}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors flex items-center space-x-2"
            >
              <span>Limpar</span>
            </button>
          )}
        </div>

        {/* Área de carregamento ou dados */}
        {loading ? (
          // Indicador de carregamento
          <div className="flex items-center justify-center min-h-64">
            <Loader className="h-8 w-8 animate-spin text-green-600" />
            <span className="ml-3 text-gray-600">Carregando dados...</span>
          </div>
        ) : (
          // Exibição estruturada dos dados
          <>
            {/* Cabeçalho da tabela com informações */}
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-4 mb-3">
                    <h3 className="text-lg font-semibold text-blue-900 flex items-center">
                      <Database className="h-5 w-5 mr-2" />
                      Tabela:
                    </h3>
                    <select
                      value={selectedTable}
                      onChange={handleTableChange}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm font-medium text-blue-900"
                    >
                      {allowedTables.map((table) => (
                        <option key={table.value} value={table.value}>
                          {table.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <h4 className="text-base font-medium text-blue-800 flex items-center">
                    <Database className="h-5 w-5 mr-2" />
                    {getTableDisplayName()}
                  </h4>
                  <p className="text-sm text-blue-700 mt-1">
                    {meta ? `${meta.totalRows} registros encontrados` : 'Carregando informações...'}
                    {filterText && ` • Filtro: "${filterText}"`}
                    {getColumnNames().length > 0 && ` • ${getColumnNames().length} colunas`}
                  </p>
                </div>
                {sortBy && (
                  <div className="text-sm text-blue-700">
                    Ordenado por: <span className="font-mono">{sortBy}</span> ({sortOrder})
                  </div>
                )}
              </div>
            </div>

            {data.length === 0 ? (
              // Mensagem quando não há dados para exibir
              <div className="text-center p-12 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <Database className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-700 mb-2">Nenhum dado encontrado</h3>
                <p className="text-sm">
                  {filterText 
                    ? `Não foram encontrados registros com o filtro "${filterText}".`
                    : `A tabela selecionada não possui dados para exibir.`
                  }
                </p>
                {filterText && (
                  <button
                    onClick={() => setFilterText('')}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Limpar filtro
                  </button>
                )}
              </div>
            ) : (
              // Tabela estruturada com dados
              <>
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  {/* Cabeçalho das colunas */}
                  <div className="bg-gray-50 border-b border-gray-200 px-6 py-3">
                    <h5 className="text-sm font-semibold text-gray-700 uppercase tracking-wider flex items-center justify-between">
                      <span>Dados ({getColumnNames().length} colunas)</span>
                      <span className="text-xs normal-case text-gray-500">
                        {data.length} {data.length === 1 ? 'registro' : 'registros'} nesta página
                      </span>
                    </h5>
                  </div>
                  
                  {/* Tabela de dados */}
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            #
                          </th>
                          {getColumnNames().map((colName) => (
                            <th
                              key={colName}
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors"
                              onClick={() => handleSort(colName)}
                            >
                              <div className="flex items-center space-x-1">
                                <span className="font-mono">
                                  {colName === 'sensor_descricao' ? 'Descrição do Sensor' :
                                   colName === 'grupo_nome' ? 'Nome do Grupo' :
                                   colName === 'data_registro' ? 'Data/Hora' :
                                   colName}
                                </span>
                                {renderSortIcon(colName)}
                              </div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {data.map((row, rowIndex) => (
                          <tr key={rowIndex} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-500">
                              {(currentPage - 1) * pageSize + rowIndex + 1}
                            </td>
                            {getColumnNames().map((colName, colIndex) => (
                              <td key={colIndex} className="px-6 py-4 text-sm text-gray-900">
                                <div className="max-w-xs" title={String(row[colName] || 'null')}>
                                  {formatCellValue(row[colName])}
                                </div>
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Controles de Paginação */}
                {meta && meta.totalPages > 1 && (
                  <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-700">
                      <span>
                        Página <span className="font-medium">{currentPage}</span> de{' '}
                        <span className="font-medium">{meta.totalPages}</span>
                      </span>
                      <span className="mx-2">•</span>
                      <span>
                        Mostrando <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span> a{' '}
                        <span className="font-medium">{Math.min(currentPage * pageSize, meta.totalRows)}</span> de{' '}
                        <span className="font-medium">{meta.totalRows}</span> registros
                      </span>
                    </div>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => setCurrentPage(1)}
                        disabled={currentPage === 1}
                        className="px-3 py-1 text-xs border border-gray-300 rounded text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Primeira
                      </button>
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1 text-xs border border-gray-300 rounded text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Anterior
                      </button>
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(meta.totalPages, prev + 1))}
                        disabled={currentPage === meta.totalPages}
                        className="px-3 py-1 text-xs border border-gray-300 rounded text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Próxima
                      </button>
                      <button
                        onClick={() => setCurrentPage(meta.totalPages)}
                        disabled={currentPage === meta.totalPages}
                        className="px-3 py-1 text-xs border border-gray-300 rounded text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Última
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default RawDataViewer;