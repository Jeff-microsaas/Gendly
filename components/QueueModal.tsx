import React, { useState, useMemo } from 'react';
import { X, Search, ChevronRight, CheckCircle2, User, Layers, Scissors, ListOrdered } from 'lucide-react';
import { Client, Product } from '../types';

interface QueueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (clientId: string, serviceId: string) => void;
  clients: Client[];
  services: Product[];
}

export const QueueModal: React.FC<QueueModalProps> = ({ isOpen, onClose, onConfirm, clients, services }) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedService, setSelectedService] = useState<Product | null>(null);
  
  // Tab State for Step 2
  const [serviceTab, setServiceTab] = useState<'SINGLE' | 'PACKAGE'>('SINGLE');

  // Reset on open
  React.useEffect(() => {
    if (isOpen) {
      setStep(1);
      setSearchTerm('');
      setSelectedClient(null);
      setSelectedService(null);
      setServiceTab('SINGLE');
    }
  }, [isOpen]);

  const filteredClients = useMemo(() => {
    return clients.filter(c => 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.nickname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.whatsapp.includes(searchTerm)
    );
  }, [clients, searchTerm]);

  const filteredServices = useMemo(() => {
    return services.filter(s => {
      const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = serviceTab === 'SINGLE' ? s.subtype !== 'PACKAGE' : s.subtype === 'PACKAGE';
      return matchesSearch && matchesType;
    });
  }, [services, searchTerm, serviceTab]);

  const handleConfirm = () => {
    if (selectedClient && selectedService) {
      onConfirm(selectedClient.id, selectedService.id);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-orange-900/20 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="bg-white p-6 border-b border-gray-100 flex justify-between items-center">
          <div className="flex items-center gap-3">
             <div className="bg-orange-100 p-2 rounded-xl text-orange-600">
                <ListOrdered size={24} />
             </div>
             <div>
                <h2 className="text-xl font-bold text-gray-800">Fila de Espera</h2>
                <p className="text-xs text-gray-500">
                   {step === 1 ? 'Passo 1: Identificar Cliente' : 'Passo 2: Escolher Serviço'}
                </p>
             </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-50 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 bg-gray-50 border-b border-gray-100">
           <div className="relative">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
             <input 
               type="text" 
               placeholder={step === 1 ? "Buscar cliente por nome ou telefone..." : "Buscar serviço..."}
               className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 transition-all"
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               autoFocus
             />
           </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-2">
           {step === 1 ? (
              // Step 1: Client List
              filteredClients.length > 0 ? (
                  <div className="space-y-1">
                      {filteredClients.map(client => (
                          <button
                              key={client.id}
                              onClick={() => {
                                  setSelectedClient(client);
                                  setSearchTerm('');
                                  setStep(2);
                              }}
                              className="w-full flex items-center justify-between p-3 hover:bg-orange-50 rounded-xl group transition-colors text-left"
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
                                      <div className="font-bold text-gray-800 group-hover:text-orange-700">{client.name}</div>
                                      <div className="text-xs text-gray-400 flex items-center gap-2">
                                          <span>{client.nickname}</span>
                                      </div>
                                  </div>
                              </div>
                              <ChevronRight size={16} className="text-gray-300 group-hover:text-orange-400" />
                          </button>
                      ))}
                  </div>
              ) : (
                  <div className="text-center py-12 text-gray-400">
                      <User size={48} className="mx-auto mb-2 opacity-20" />
                      <p>Nenhum cliente encontrado.</p>
                  </div>
              )
           ) : (
              // Step 2: Service List with Tabs
              <div className="p-2">
                  {/* Tabs */}
                  <div className="flex bg-gray-100 p-1 rounded-xl mb-4">
                      <button
                          onClick={() => setServiceTab('SINGLE')}
                          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
                              serviceTab === 'SINGLE' 
                              ? 'bg-white text-blue-600 shadow-sm' 
                              : 'text-gray-400 hover:text-gray-600'
                          }`}
                      >
                          <Scissors size={14} />
                          Serviços
                      </button>
                      <button
                          onClick={() => setServiceTab('PACKAGE')}
                          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
                              serviceTab === 'PACKAGE' 
                              ? 'bg-white text-purple-600 shadow-sm' 
                              : 'text-gray-400 hover:text-gray-600'
                          }`}
                      >
                          <Layers size={14} />
                          Pacotes
                      </button>
                  </div>

                  {filteredServices.length > 0 ? (
                      <div className="space-y-1">
                          {filteredServices.map(service => {
                              const isPackage = service.subtype === 'PACKAGE';
                              const isSelected = selectedService?.id === service.id;
                              return (
                                  <button
                                      key={service.id}
                                      onClick={() => setSelectedService(service)}
                                      className={`w-full flex items-center justify-between p-3 rounded-xl transition-all text-left border ${isSelected ? 'bg-orange-50 border-orange-300 ring-1 ring-orange-300' : 'bg-white border-transparent hover:bg-gray-50'}`}
                                  >
                                      <div className="flex items-center gap-3 overflow-hidden">
                                          <div className={`p-2 rounded-lg shrink-0 ${isPackage ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                                              {isPackage ? <Layers size={18} /> : <Scissors size={18} />}
                                          </div>
                                          <div className="min-w-0">
                                              <div className={`font-bold text-sm truncate ${isSelected ? 'text-orange-800' : 'text-gray-800'}`}>{service.name}</div>
                                              <div className="text-xs text-gray-400">
                                                  {isPackage ? `${service.sessionCount} Sessões` : `R$ ${service.price.toFixed(2)}`}
                                              </div>
                                          </div>
                                      </div>
                                      {isSelected && <CheckCircle2 size={20} className="text-orange-500" />}
                                  </button>
                              );
                          })}
                      </div>
                  ) : (
                      <div className="text-center py-12 text-gray-400">
                          {serviceTab === 'SINGLE' ? <Scissors size={48} className="mx-auto mb-2 opacity-20" /> : <Layers size={48} className="mx-auto mb-2 opacity-20" />}
                          <p>Nenhum {serviceTab === 'SINGLE' ? 'serviço' : 'pacote'} encontrado.</p>
                      </div>
                  )}
              </div>
           )}
        </div>

        {/* Footer Actions */}
        {step === 2 && (
            <div className="p-6 border-t border-gray-100 bg-gray-50 flex gap-3">
                <button 
                    onClick={() => { setStep(1); setSelectedService(null); setServiceTab('SINGLE'); }}
                    className="px-6 py-3 rounded-xl border border-gray-200 text-gray-500 font-bold text-sm hover:bg-white transition-colors"
                >
                    Voltar
                </button>
                <button 
                    onClick={handleConfirm}
                    disabled={!selectedService}
                    className="flex-1 py-3 bg-orange-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-orange-200 hover:bg-orange-600 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    <CheckCircle2 size={18} />
                    Entrar na Fila
                </button>
            </div>
        )}
      </div>
    </div>
  );
};