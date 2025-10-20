import React, { useState, useEffect, useRef } from 'react';
import { User, ChevronDown, MapPin, LogOut } from 'lucide-react';
import { useGrupo } from '../contexts/GrupoContext';
import { supabase } from '../lib/supabase';

interface HeaderProps {
  userRole: 'producer' | 'slaughterhouse';
  setUserRole: (role: 'producer' | 'slaughterhouse') => void;
}

const Header: React.FC<HeaderProps> = ({ userRole, setUserRole }) => {
  const { grupoSelecionado, setGrupoSelecionado, gruposDisponiveis, loadingGrupos } = useGrupo();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error('Erro ao fazer logout:', error);
        alert('Erro ao fazer logout. Tente novamente.');
      } else {
        window.location.reload();
      }
    } catch (err) {
      console.error('Erro inesperado ao fazer logout:', err);
      alert('Erro ao fazer logout. Tente novamente.');
    } finally {
      setLoggingOut(false);
    }
  };

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

          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-3 px-4 py-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              disabled={loggingOut}
            >
              <User className="h-5 w-5 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">
                {userRole === 'producer' ? 'João Silva' : 'Maria Santos'}
              </span>
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                <button
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <LogOut className="h-4 w-4" />
                  <span>{loggingOut ? 'Saindo...' : 'Sair'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;