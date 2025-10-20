import React from 'react';
import { User, ChevronDown, MapPin } from 'lucide-react';
import { useGrupo } from '../contexts/GrupoContext';

interface HeaderProps {
  userRole: 'producer' | 'slaughterhouse';
  setUserRole: (role: 'producer' | 'slaughterhouse') => void;
}

const Header: React.FC<HeaderProps> = ({ userRole, setUserRole }) => {
  const { grupoSelecionado, setGrupoSelecionado, gruposDisponiveis, loadingGrupos } = useGrupo();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-semibold text-gray-900">
            Fordox - Monitoramento em Tempo Real
          </h2>
          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
            Sistema Online
          </span>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <MapPin className="h-4 w-4 text-gray-500" />
            <select
              value={grupoSelecionado?.id || 0}
              onChange={(e) => {
                const grupoId = parseInt(e.target.value);
                const grupo = gruposDisponiveis.find(g => g.id === grupoId);
                if (grupo) {
                  setGrupoSelecionado(grupo);
                }
              }}
              disabled={loadingGrupos}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              {loadingGrupos ? (
                <option>Carregando...</option>
              ) : (
                gruposDisponiveis.map((grupo) => (
                  <option key={grupo.id} value={grupo.id}>
                    {grupo.nome}
                  </option>
                ))
              )}
            </select>
          </div>

          <select
            value={userRole}
            onChange={(e) => setUserRole(e.target.value as 'producer' | 'slaughterhouse')}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="producer">Visão Produtor</option>
            <option value="slaughterhouse">Visão Frigorífico</option>
          </select>

          <div className="flex items-center space-x-3 px-4 py-2 bg-gray-50 rounded-lg">
            <User className="h-5 w-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">
              {userRole === 'producer' ? 'João Silva' : 'Maria Santos'}
            </span>
            <ChevronDown className="h-4 w-4 text-gray-400" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;