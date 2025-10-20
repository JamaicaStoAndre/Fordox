/**
 * Contexto para gerenciar o grupo (localização) selecionado globalmente
 *
 * Este contexto permite que todos os componentes da aplicação acessem
 * e modifiquem o grupo selecionado, garantindo que os dados exibidos
 * sejam sempre filtrados pela localização escolhida pelo usuário.
 *
 * Funcionalidades:
 * - Armazena o grupo selecionado (id e nome)
 * - Fornece função para alterar o grupo
 * - Define "Biopark" como padrão inicial
 * - Busca lista de grupos disponíveis do backend
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';

/**
 * Interface que define a estrutura de um grupo
 */
interface Grupo {
  id: number;
  nome: string;
  localizacao?: number;
}

/**
 * Interface que define o que o contexto disponibiliza
 */
interface GrupoContextType {
  grupoSelecionado: Grupo | null;
  setGrupoSelecionado: (grupo: Grupo) => void;
  gruposDisponiveis: Grupo[];
  loadingGrupos: boolean;
  errorGrupos: string | null;
}

/**
 * Criação do contexto com valor padrão undefined
 */
const GrupoContext = createContext<GrupoContextType | undefined>(undefined);

/**
 * Props do Provider
 */
interface GrupoProviderProps {
  children: ReactNode;
}

/**
 * Provider do contexto de grupo
 * Deve envolver toda a aplicação no App.tsx
 */
export const GrupoProvider: React.FC<GrupoProviderProps> = ({ children }) => {
  // Estado para armazenar o grupo selecionado
  const [grupoSelecionado, setGrupoSelecionado] = useState<Grupo | null>({
    id: 0,
    nome: 'Biopark'
  });

  // Estado para armazenar a lista de grupos disponíveis
  const [gruposDisponiveis, setGruposDisponiveis] = useState<Grupo[]>([]);

  // Estado de carregamento
  const [loadingGrupos, setLoadingGrupos] = useState(true);

  // Estado de erro
  const [errorGrupos, setErrorGrupos] = useState<string | null>(null);

  /**
   * Função para buscar os grupos disponíveis do backend
   */
  const fetchGrupos = async () => {
    try {
      setLoadingGrupos(true);
      setErrorGrupos(null);

      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        throw new Error('User not authenticated');
      }

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const response = await fetch(`${supabaseUrl}/functions/v1/get-grupos`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Edge Function HTTP Error:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        throw new Error(`Edge Function error (${response.status}): ${errorText}`);
      }

      const result = await response.json();

      if (!result.success) {
        console.error('Edge Function returned error:', result);
        throw new Error(result.error || 'Failed to fetch grupos');
      }

      const grupos = result.data.grupos || [];
      setGruposDisponiveis(grupos);

      // Se "Biopark" existir na lista, definir como selecionado
      const bioparkGrupo = grupos.find((g: Grupo) => g.nome === 'Biopark');
      if (bioparkGrupo) {
        setGrupoSelecionado(bioparkGrupo);
      } else if (grupos.length > 0) {
        // Se não encontrar Biopark, seleciona o primeiro da lista
        setGrupoSelecionado(grupos[0]);
      }

      setLoadingGrupos(false);
    } catch (error) {
      console.error('Erro ao buscar grupos:', error);
      setErrorGrupos(error.message);
      setLoadingGrupos(false);

      // Em caso de erro, usar grupos padrão mockados
      const gruposPadrao: Grupo[] = [
        { id: 1, nome: 'Biopark' },
        { id: 2, nome: 'Granja Adi Decesaro' },
        { id: 3, nome: 'Coworking Fordox' }
      ];
      setGruposDisponiveis(gruposPadrao);
      setGrupoSelecionado(gruposPadrao[0]); // Biopark como padrão
    }
  };

  /**
   * Carregar grupos ao montar o componente
   */
  useEffect(() => {
    fetchGrupos();
  }, []);

  /**
   * Valor do contexto que será disponibilizado para os componentes
   */
  const value: GrupoContextType = {
    grupoSelecionado,
    setGrupoSelecionado,
    gruposDisponiveis,
    loadingGrupos,
    errorGrupos
  };

  return (
    <GrupoContext.Provider value={value}>
      {children}
    </GrupoContext.Provider>
  );
};

/**
 * Hook personalizado para usar o contexto de grupo
 * Facilita o uso do contexto em outros componentes
 *
 * Exemplo de uso:
 * const { grupoSelecionado, setGrupoSelecionado } = useGrupo();
 */
export const useGrupo = (): GrupoContextType => {
  const context = useContext(GrupoContext);

  if (context === undefined) {
    throw new Error('useGrupo deve ser usado dentro de um GrupoProvider');
  }

  return context;
};
