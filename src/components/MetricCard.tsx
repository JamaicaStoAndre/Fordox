import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  status: 'good' | 'normal' | 'warning' | 'critical';
  change?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon: Icon, status, change }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'good': return 'text-green-600 bg-green-100';
      case 'normal': return 'text-blue-600 bg-blue-100';
      case 'warning': return 'text-orange-600 bg-orange-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getChangeColor = () => {
    if (!change) return 'text-gray-500';
    if (change.includes('+')) return 'text-green-600';
    if (change.includes('-')) return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${getStatusColor()}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
          {status === 'good' ? 'Ótimo' : status === 'normal' ? 'Normal' : status === 'warning' ? 'Atenção' : 'Crítico'}
        </div>
      </div>
      
      <div>
        <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
        <p className="text-2xl font-bold text-gray-900 mb-2">{value}</p>
        {change && (
          <p className={`text-sm ${getChangeColor()}`}>{change}</p>
        )}
      </div>
    </div>
  );
};

export default MetricCard;