import React, { useState } from 'react';
import { AlertTriangle, Bell, Clock, CheckCircle, X, Filter } from 'lucide-react';

interface Alert {
  id: number;
  type: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  time: string;
  location: string;
  resolved: boolean;
}

const Alerts: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'critical' | 'warning' | 'info'>('all');
  
  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: 1,
      type: 'critical',
      title: 'Temperatura Crítica',
      message: 'Temperatura de 28.5°C detectada no Galpão C - Limite: 25°C',
      time: '5 min atrás',
      location: 'Galpão C',
      resolved: false
    },
    {
      id: 2,
      type: 'warning',
      title: 'Umidade Elevada',
      message: 'Umidade de 82% no Pasto A - Recomendado: <75%',
      time: '12 min atrás',
      location: 'Pasto A',
      resolved: false
    },
    {
      id: 3,
      type: 'info',
      title: 'Alimentação Programada',
      message: 'Próxima alimentação agendada para 14:00',
      time: '30 min atrás',
      location: 'Todos os setores',
      resolved: false
    },
    {
      id: 4,
      type: 'warning',
      title: 'Sensor Offline',
      message: 'Sensor de qualidade do ar ST-001 não está respondendo',
      time: '1 hora atrás',
      location: 'Galpão A',
      resolved: true
    }
  ]);

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical': return AlertTriangle;
      case 'warning': return Bell;
      case 'info': return Clock;
      default: return Bell;
    }
  };

  const getAlertStyle = (type: string, resolved: boolean) => {
    if (resolved) return 'bg-gray-50 border-gray-200 opacity-60';
    
    switch (type) {
      case 'critical': return 'bg-red-50 border-red-200';
      case 'warning': return 'bg-orange-50 border-orange-200';
      case 'info': return 'bg-blue-50 border-blue-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const getAlertTextColor = (type: string, resolved: boolean) => {
    if (resolved) return 'text-gray-600';
    
    switch (type) {
      case 'critical': return 'text-red-800';
      case 'warning': return 'text-orange-800';
      case 'info': return 'text-blue-800';
      default: return 'text-gray-800';
    }
  };

  const resolveAlert = (id: number) => {
    setAlerts(alerts.map(alert => 
      alert.id === id ? { ...alert, resolved: true } : alert
    ));
  };

  const filteredAlerts = alerts.filter(alert => 
    filter === 'all' || alert.type === filter
  );

  const criticalCount = alerts.filter(a => a.type === 'critical' && !a.resolved).length;
  const warningCount = alerts.filter(a => a.type === 'warning' && !a.resolved).length;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Central de Alertas</h2>
          <div className="flex items-center space-x-4">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">Todos os Alertas</option>
              <option value="critical">Críticos</option>
              <option value="warning">Avisos</option>
              <option value="info">Informativos</option>
            </select>
          </div>
        </div>

        {/* Alert Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="h-6 w-6 text-red-600" />
              <div>
                <p className="text-red-800 font-semibold">{criticalCount} Alertas Críticos</p>
                <p className="text-red-600 text-sm">Requer ação imediata</p>
              </div>
            </div>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <Bell className="h-6 w-6 text-orange-600" />
              <div>
                <p className="text-orange-800 font-semibold">{warningCount} Avisos</p>
                <p className="text-orange-600 text-sm">Monitoramento necessário</p>
              </div>
            </div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <div>
                <p className="text-green-800 font-semibold">Sistema Estável</p>
                <p className="text-green-600 text-sm">Parâmetros normais</p>
              </div>
            </div>
          </div>
        </div>

        {/* Alert List */}
        <div className="space-y-4">
          {filteredAlerts.map((alert) => {
            const Icon = getAlertIcon(alert.type);
            return (
              <div
                key={alert.id}
                className={`border rounded-lg p-4 ${getAlertStyle(alert.type, alert.resolved)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className={`p-2 rounded-lg ${getAlertStyle(alert.type, alert.resolved)}`}>
                      <Icon className={`h-5 w-5 ${getAlertTextColor(alert.type, alert.resolved)}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className={`font-semibold ${getAlertTextColor(alert.type, alert.resolved)}`}>
                          {alert.title}
                        </h4>
                        {alert.resolved && (
                          <span className="px-2 py-1 bg-gray-200 text-gray-700 rounded-full text-xs">
                            Resolvido
                          </span>
                        )}
                      </div>
                      <p className={`text-sm ${getAlertTextColor(alert.type, alert.resolved)} mb-2`}>
                        {alert.message}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>{alert.time}</span>
                        <span>•</span>
                        <span>{alert.location}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {!alert.resolved && (
                      <button
                        onClick={() => resolveAlert(alert.id)}
                        className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm font-medium transition-colors"
                      >
                        Resolver
                      </button>
                    )}
                    <button className="p-1 hover:bg-gray-200 rounded transition-colors">
                      <X className="h-4 w-4 text-gray-400" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Alert Configuration */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuração de Alertas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-medium text-gray-700">Limites Críticos</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <span className="text-gray-700">Temperatura Máxima</span>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    defaultValue="25"
                    className="w-16 px-2 py-1 border border-gray-300 rounded text-center text-sm"
                  />
                  <span className="text-gray-500 text-sm">°C</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <span className="text-gray-700">Umidade Máxima</span>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    defaultValue="75"
                    className="w-16 px-2 py-1 border border-gray-300 rounded text-center text-sm"
                  />
                  <span className="text-gray-500 text-sm">%</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <span className="text-gray-700">Qualidade do Ar Mínima</span>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    defaultValue="80"
                    className="w-16 px-2 py-1 border border-gray-300 rounded text-center text-sm"
                  />
                  <span className="text-gray-500 text-sm">%</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-medium text-gray-700">Notificações</h4>
            <div className="space-y-3">
              <label className="flex items-center space-x-3">
                <input type="checkbox" defaultChecked className="rounded border-gray-300 text-green-600 focus:ring-green-500" />
                <span className="text-gray-700">Email em alertas críticos</span>
              </label>
              <label className="flex items-center space-x-3">
                <input type="checkbox" defaultChecked className="rounded border-gray-300 text-green-600 focus:ring-green-500" />
                <span className="text-gray-700">SMS em emergências</span>
              </label>
              <label className="flex items-center space-x-3">
                <input type="checkbox" className="rounded border-gray-300 text-green-600 focus:ring-green-500" />
                <span className="text-gray-700">Notificações push</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Alerts;