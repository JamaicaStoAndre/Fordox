import React, { useState } from 'react';
import { Download, Calendar, FileText, BarChart3, Shield } from 'lucide-react';

interface ReportsProps {
  userRole: 'producer' | 'slaughterhouse';
}

const Reports: React.FC<ReportsProps> = ({ userRole }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('7days');

  const reportTypes = userRole === 'producer' ? [
    {
      id: 'safety',
      title: 'Relatório de Segurança Alimentar',
      description: 'Compliance com normas sanitárias e rastreabilidade',
      icon: Shield,
      color: 'bg-green-100 text-green-600'
    },
    {
      id: 'conversion',
      title: 'Análise de Conversão Alimentar',
      description: 'Eficiência alimentar e performance do rebanho',
      icon: BarChart3,
      color: 'bg-blue-100 text-blue-600'
    },
    {
      id: 'environmental',
      title: 'Condições Ambientais',
      description: 'Temperatura, umidade e qualidade do ar',
      icon: FileText,
      color: 'bg-orange-100 text-orange-600'
    }
  ] : [
    {
      id: 'traceability',
      title: 'Rastreabilidade de Origem',
      description: 'Histórico completo dos animais recebidos',
      icon: Shield,
      color: 'bg-green-100 text-green-600'
    },
    {
      id: 'quality',
      title: 'Controle de Qualidade',
      description: 'Inspeções e certificações sanitárias',
      icon: FileText,
      color: 'bg-blue-100 text-blue-600'
    },
    {
      id: 'compliance',
      title: 'Compliance Regulatório',
      description: 'Conformidade com normas ANVISA e MAPA',
      icon: BarChart3,
      color: 'bg-orange-100 text-orange-600'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Relatórios e Análises</h2>
          <div className="flex items-center space-x-4">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="7days">Últimos 7 dias</option>
              <option value="30days">Últimos 30 dias</option>
              <option value="90days">Últimos 90 dias</option>
              <option value="1year">Último ano</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reportTypes.map((report) => {
            const Icon = report.icon;
            return (
              <div key={report.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200">
                <div className={`w-12 h-12 rounded-lg ${report.color} flex items-center justify-center mb-4`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{report.title}</h3>
                <p className="text-gray-600 text-sm mb-4">{report.description}</p>
                <div className="flex space-x-2">
                  <button className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center space-x-2 transition-colors">
                    <Download className="h-4 w-4" />
                    <span>Gerar PDF</span>
                  </button>
                  <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    <Calendar className="h-4 w-4 text-gray-600" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Reports */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Relatórios Recentes</h3>
        <div className="space-y-4">
          {[
            {
              name: 'Relatório Semanal de Segurança Alimentar',
              date: '2025-01-10',
              size: '2.3 MB',
              status: 'Concluído'
            },
            {
              name: 'Análise de Conversão - Dezembro 2024',
              date: '2025-01-05',
              size: '1.8 MB',
              status: 'Concluído'
            },
            {
              name: 'Condições Ambientais - Semana 2',
              date: '2025-01-08',
              size: '3.1 MB',
              status: 'Processando'
            }
          ].map((report, index) => (
            <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-4">
                <FileText className="h-8 w-8 text-gray-400" />
                <div>
                  <h4 className="font-medium text-gray-900">{report.name}</h4>
                  <p className="text-sm text-gray-600">{report.date} • {report.size}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  report.status === 'Concluído' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                }`}>
                  {report.status}
                </span>
                {report.status === 'Concluído' && (
                  <button className="text-green-600 hover:text-green-700 transition-colors">
                    <Download className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Reports;