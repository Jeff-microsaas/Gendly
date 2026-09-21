import React, { useState, useMemo } from 'react';
import { X, Search, User, ChevronRight } from 'lucide-react';
import { Client } from '../types';

interface ClientSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (client: Client) => void;
  clients: Client[];
}

export const ClientSelector: React.FC<ClientSelectorProps> = ({ isOpen, onClose, onSelect, clients }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredClients = useMemo(() => {
    return clients.filter(c => 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.nickname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.whatsapp.includes(searchTerm)
    );
  }, [clients, searchTerm]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-lilac-900/20 backdrop-blur-sm p-4 transition-opacity">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col border border-white/50 overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-white">
          <div>
             <h2 className="text-xl font-bold text-gray-800">Selecionar Cliente</h2>
             <p className="text-xs text-gray-400 mt-1 font-medium">Para quem é esta venda?</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-50 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 bg-gray-50 border-b border-gray-100">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Buscar por nome, apelido ou telefone..." 
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-200 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
          </div>
        </div>

        {/* List */}
        <div className="overflow-y-auto p-2 flex-1">
          {filteredClients.length > 0 ? (
            <div className="space-y-1">
              {filteredClients.map(client => (
                <button
                  key={client.id}
                  onClick={() => onSelect(client)}
                  className="w-full flex items-center justify-between p-3 hover:bg-purple-50 rounded-xl group transition-colors text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      {client.avatar ? (
                        <img src={client.avatar} alt={client.name} className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-lilac-100 flex items-center justify-center text-lilac-600 font-bold">
                          {client.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="font-bold text-gray-800 group-hover:text-purple-700">{client.name}</div>
                      <div className="text-xs text-gray-400 group-hover:text-purple-400 flex items-center gap-2">
                         <span>{client.nickname}</span>
                         {client.whatsapp && <span className="w-1 h-1 rounded-full bg-gray-300"></span>}
                         <span>{client.whatsapp}</span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-gray-300 group-hover:text-purple-400" />
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-gray-400">
              <User size={48} className="mb-2 opacity-20" />
              <p className="text-sm">Nenhum cliente encontrado.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
