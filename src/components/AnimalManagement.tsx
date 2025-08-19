import React, { useState } from 'react';
import { Search, Filter, Plus, Eye, MoreHorizontal } from 'lucide-react';

interface Animal {
  id: string;
  tag: string;
  breed: string;
  age: number;
  weight: number;
  health: 'excellent' | 'good' | 'concern' | 'critical';
  lastFeed: string;
  location: string;
}

const AnimalManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const animals: Animal[] = [
    {
      id: '1',
      tag: 'BR001234',
      breed: 'Nelore',
      age: 18,
      weight: 485,
      health: 'excellent',
      lastFeed: '2 horas atrás',
      location: 'Pasto A'
    },
    {
      id: '2',
      tag: 'BR001235',
      breed: 'Angus',
      age: 20,
      weight: 520,
      health: 'good',
      lastFeed: '1 hora atrás',
      location: 'Pasto B'
    },
    {
      id: '3',
      tag: 'BR001236',
      breed: 'Brahman',
      age: 16,
      weight: 445,
      health: 'concern',
      lastFeed: '4 horas atrás',
      location: 'Enfermaria'
    },
    {
      id: '4',
      tag: 'BR001237',
      breed: 'Nelore',
      age: 22,
      weight: 510,
      health: 'excellent',
      lastFeed: '1 hora atrás',
      location: 'Pasto A'
    },
  ];

  const getHealthStatus = (health: string) => {
    switch (health) {
      case 'excellent':
        return 'bg-green-100 text-green-800';
      case 'good':
        return 'bg-blue-100 text-blue-800';
      case 'concern':
        return 'bg-orange-100 text-orange-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredAnimals = animals.filter(animal =>
    animal.tag.toLowerCase().includes(searchTerm.toLowerCase()) ||
    animal.breed.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Gestão Animal</h2>
          <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
            <Plus className="h-4 w-4" />
            <span>Novo Animal</span>
          </button>
        </div>

        <div className="flex space-x-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por tag ou raça..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2 transition-colors">
            <Filter className="h-4 w-4" />
            <span>Filtros</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Tag</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Raça</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Idade</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Peso</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Saúde</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Última Alimentação</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Localização</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredAnimals.map((animal) => (
                <tr key={animal.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4 font-mono text-sm">{animal.tag}</td>
                  <td className="py-3 px-4">{animal.breed}</td>
                  <td className="py-3 px-4">{animal.age} meses</td>
                  <td className="py-3 px-4 font-semibold">{animal.weight}kg</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getHealthStatus(animal.health)}`}>
                      {animal.health === 'excellent' ? 'Excelente' : 
                       animal.health === 'good' ? 'Bom' :
                       animal.health === 'concern' ? 'Atenção' : 'Crítico'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{animal.lastFeed}</td>
                  <td className="py-3 px-4">{animal.location}</td>
                  <td className="py-3 px-4">
                    <div className="flex space-x-2">
                      <button className="p-1 hover:bg-gray-200 rounded transition-colors">
                        <Eye className="h-4 w-4 text-gray-600" />
                      </button>
                      <button className="p-1 hover:bg-gray-200 rounded transition-colors">
                        <MoreHorizontal className="h-4 w-4 text-gray-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumo do Rebanho</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Total de Animais:</span>
              <span className="font-semibold">847</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Peso Médio:</span>
              <span className="font-semibold">465kg</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Idade Média:</span>
              <span className="font-semibold">19 meses</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Status de Saúde</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Excelente:</span>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="font-semibold">765 (90%)</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Bom:</span>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="font-semibold">69 (8%)</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Atenção:</span>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span className="font-semibold">13 (2%)</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Localização</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Pasto A:</span>
              <span className="font-semibold">312 animais</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Pasto B:</span>
              <span className="font-semibold">298 animais</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Confinamento:</span>
              <span className="font-semibold">224 animais</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Enfermaria:</span>
              <span className="font-semibold">13 animais</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimalManagement;