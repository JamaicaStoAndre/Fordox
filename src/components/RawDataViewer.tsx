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
  const allowedTables = ['informacoes', 'sensor', 'grupo'];

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
    return Object.keys(data);
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho da página e seleção de tabela */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Visualizador de Dados Brutos</h2>
          <div className="flex items-center space-x-4">
            <label htmlFor="table-select" className="sr-only">Selecionar Tabela</label>
            <select
              id="table-select"
              value={selectedTable}
              onChange={handleTableChange}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              {allowedTables.map((table) => (
                <option key={table} value={table}>
                  {table}
                </option>
              ))}
            </select>
          </div>
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
              placeholder={`Filtrar dados na tabela "${selectedTable}"...`}
              value={filterText}
              onChange={handleFilterChange}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Área de carregamento ou dados */}
        {loading ? (
          // Indicador de carregamento
          <div className="flex items-center justify-center min-h-64">
            <Loader className="h-8 w-8 animate-spin text-green-600" />
            <span className="ml-3 text-gray-600">Carregando dados...</span>
          </div>
        ) : data.length === 0 ? (
          // Mensagem de "nenhum dado encontrado"
          <div className="text-center p-8 text-gray-500">
            <Database className="h-12 w-12 mx-auto mb-4" />
            <p>Nenhum dado encontrado para a tabela "{selectedTable}" com o filtro atual.</p>
          </div>
        ) : (
          // Tabela de dados
          <>
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {getColumnNames().map((colName) => (
                      <th
                        key={colName}
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort(colName)} // Adiciona evento de clique para ordenação
                      >
                        <div className="flex items-center">
                          {colName}
                          {renderSortIcon(colName)} {/* Ícone de ordenação */}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {getColumnNames().map((colName, colIndex) => (
                        <td key={colIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                          {String(row[colName])} {/* Exibe o valor da célula */}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Controles de Paginação */}
            {meta && (
              <nav
                className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6"
                aria-label="Pagination"
              >
                <div className="hidden sm:block">
                  <p className="text-sm text-gray-700">
                    Mostrando <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span> a{' '}
                    <span className="font-medium">{Math.min(currentPage * pageSize, meta.totalRows)}</span> de{' '}
                    <span className="font-medium">{meta.totalRows}</span> resultados
                  </p>
                </div>
                <div className="flex-1 flex justify-between sm:justify-end">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Anterior
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(meta.totalPages, prev + 1))}
                    disabled={currentPage === meta.totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Próximo
                  </button>
                </div>
              </nav>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default RawDataViewer;