import React from 'react';
import { Monitor, Users, TrendingUp, Bell, Settings, Factory, Beef, Cog } from 'lucide-react';

interface SidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  userRole: 'producer' | 'slaughterhouse';
}

const Sidebar: React.FC<SidebarProps> = ({ activeSection, setActiveSection, userRole }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Monitor },
    { id: 'animals', label: 'Gestão Animal', icon: Users },
    { id: 'reports', label: 'Relatórios', icon: TrendingUp },
    { id: 'alerts', label: 'Alertas', icon: Bell },
    { id: 'settings', label: 'Configurações', icon: Cog },
  ];

  return (
    <div className="w-64 bg-white shadow-lg flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          {userRole === 'producer' ? (
            <Factory className="h-8 w-8 text-green-600" />
          ) : (
            <Beef className="h-8 w-8 text-blue-600" />
          )}
          <div>
            <h1 className="text-xl font-bold text-gray-900">FarmWatch</h1>
            <p className="text-sm text-gray-500 capitalize">
              {userRole === 'producer' ? 'Produtor' : 'Frigorífico'}
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <button
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                    activeSection === item.id
                      ? 'bg-green-50 text-green-700 border-l-4 border-green-600'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-green-600'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-200">
      </div>
    </div>
  );
};

export default Sidebar;