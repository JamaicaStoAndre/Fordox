import React from 'react';
import { AlertTriangle, Info, X } from 'lucide-react';

interface Alert {
  id: number;
  type: 'warning' | 'info' | 'critical';
  message: string;
  time: string;
}

interface AlertBannerProps {
  alert: Alert;
}

const AlertBanner: React.FC<AlertBannerProps> = ({ alert }) => {
  const getAlertStyle = () => {
    switch (alert.type) {
      case 'critical':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-orange-50 border-orange-200 text-orange-800';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getIcon = () => {
    switch (alert.type) {
      case 'critical':
      case 'warning':
        return AlertTriangle;
      case 'info':
        return Info;
      default:
        return Info;
    }
  };

  const Icon = getIcon();

  return (
    <div className={`rounded-lg border p-4 ${getAlertStyle()}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Icon className="h-5 w-5" />
          <div>
            <p className="font-medium">{alert.message}</p>
            <p className="text-sm opacity-75">{alert.time}</p>
          </div>
        </div>
        <button className="hover:opacity-75 transition-opacity">
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default AlertBanner;