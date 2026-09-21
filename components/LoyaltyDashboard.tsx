import React, { useMemo, useState } from 'react';
import { Heart, Trophy, Crown, Gift, Star, Trash2, X, AlertTriangle } from 'lucide-react';
import { Client, Sale, Product } from '../types';
import { LoyaltyRewardModal } from './LoyaltyRewardModal';

interface LoyaltyDashboardProps {
  clients: Client[];
  sales: Sale[];
  products: Product[]; 
  settings: {
    enabled: boolean;
    serviceGoal: number; 
  };
  onRegisterRedemption: (data: any) => void;
}

// Local Confirm Modal for Dismissing
const ConfirmDismissModal: React.FC<{ 
    isOpen: boolean; 
    onClose: () => void; 
    onConfirm: () => void; 
    clientName: string;
}> = ({ isOpen, onClose, onConfirm, clientName }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-8 text-center">
                    <div className="w-16 h-16 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <AlertTriangle size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Remover da Lista?</h3>
                    <p className="text-gray-500 text-sm leading-relaxed mb-8">
                        Deseja ocultar <b>{clientName}</b> da lista de fidelizados? Esta ação apenas remove o destaque visual nesta tela.
                    </p>
                    <div className="flex gap-3">
                        <button 
                            onClick={onClose}
                            className="flex-1 py-3.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold rounded-xl transition-colors text-sm"
                        >
                            Cancelar
                        </button>
                        <button 
                            onClick={onConfirm}
                            className="flex-1 py-3.5 px-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl shadow-lg shadow-orange-200 transition-all text-sm"
                        >
                            Confirmar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const LoyaltyDashboard: React.FC<LoyaltyDashboardProps> = ({ clients, sales, products, settings, onRegisterRedemption }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [rewardingClient, setRewardingClient] = useState<Client | null>(null);
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);
  const [itemToDismiss, setItemToDismiss] = useState<Client | null>(null);

  const eligibleClients = useMemo(() => {
    return clients.map(client => {
      const clientSales = sales.filter(s => s.clientId === client.id);
      const totalVisits = clientSales.length;
      const rewardsEarned = Math.floor(totalVisits / settings.serviceGoal);

      return {
        ...client,
        totalVisits,
        rewardsEarned
      };
    })
    .filter(c => c.totalVisits >= settings.serviceGoal && !dismissedIds.includes(c.id))
    .sort((a, b) => b.totalVisits - a.totalVisits); 
  }, [clients, sales, settings, dismissedIds]);

  const filteredClients = useMemo(() => {
    return eligibleClients.filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        c.nickname.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [eligibleClients, searchTerm]);

  const handleDismiss = (client: Client) => {
      setItemToDismiss(client);
  };

  const confirmDismiss = () => {
      if (itemToDismiss) {
          setDismissedIds(prev => [...prev, itemToDismiss.id]);
          setItemToDismiss(null);
      }
  };

  if (!settings.enabled) {
      return (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                  <Heart size={48} className="text-gray-300" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Programa de Fidelidade Desativado</h2>
              <p className="text-gray-500 max-w-md">
                  Ative o programa de fidelidade nas configurações para começar a recompensar seus clientes.
              </p>
          </div>
      );
  }

  return (
    <div className="max-w-7xl mx-auto pb-10">
      
      <LoyaltyRewardModal 
        isOpen={!!rewardingClient}
        onClose={() => setRewardingClient(null)}
        client={rewardingClient}
        products={products}
        onRegisterRedemption={onRegisterRedemption}
      />

      <ConfirmDismissModal 
        isOpen={!!itemToDismiss}
        onClose={() => setItemToDismiss(null)}
        onConfirm={confirmDismiss}
        clientName={itemToDismiss?.nickname || itemToDismiss?.name || ''}
      />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
           <h2 className="text-3xl font-bold text-gray-900 mb-1 flex items-center gap-2">
               <Heart className="text-rose-500 fill-rose-500" /> Fidelizados
           </h2>
           <p className="text-gray-400">
               Clientes que atingiram a meta de <b>{settings.serviceGoal} atendimentos</b>.
           </p>
        </div>
      </div>

      {eligibleClients.length > 0 && (
          <div className="mb-8">
             <input 
                type="text" 
                placeholder="Buscar cliente premiado..." 
                className="w-full md:w-96 px-5 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-200 shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
             />
          </div>
      )}

      {filteredClients.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
             {filteredClients.map((client, index) => (
                 <div 
                    key={client.id} 
                    className="relative bg-white rounded-[2rem] p-6 shadow-lg border border-purple-50 flex flex-col items-center text-center transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl group overflow-hidden"
                 >
                      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-yellow-400 via-purple-500 to-pink-500"></div>
                      
                      <button 
                          onClick={(e) => { e.stopPropagation(); handleDismiss(client); }}
                          className="absolute top-3 left-3 p-2 text-red-500 bg-red-50 hover:bg-red-100 rounded-full transition-colors z-20 shadow-sm"
                          title="Remover da lista"
                      >
                          <Trash2 size={18} />
                      </button>

                      <div className="absolute top-4 right-4">
                          <div className="bg-yellow-100 text-yellow-700 p-2 rounded-full shadow-sm animate-bounce">
                              <Crown size={20} fill="currentColor" />
                          </div>
                      </div>

                      <div className="absolute top-12 left-5 text-xs font-black text-gray-200">
                          #{index + 1}
                      </div>

                      <div className="relative w-28 h-28 mb-5 mt-2">
                          <div className="absolute inset-0 bg-gradient-to-tr from-purple-400 to-pink-400 rounded-full blur-lg opacity-40 group-hover:opacity-70 transition-opacity animate-pulse"></div>
                          {client.avatar ? (
                              <img src={client.avatar} alt={client.name} className="relative w-full h-full rounded-full object-cover border-4 border-white shadow-md z-10" />
                          ) : (
                              <div className="relative w-full h-full rounded-full bg-gray-100 flex items-center justify-center text-gray-400 font-bold text-3xl border-4 border-white shadow-md z-10">
                                  {client.name.charAt(0)}
                              </div>
                          )}
                          <div className="absolute bottom-0 right-0 z-20 bg-white rounded-full p-1 shadow-sm">
                              <div className="bg-emerald-500 w-5 h-5 rounded-full flex items-center justify-center">
                                  <Star size={10} className="text-white fill-white" />
                              </div>
                          </div>
                      </div>

                      <h3 className="text-xl font-bold text-gray-800 mb-1 leading-tight">{client.nickname || client.name}</h3>
                      {client.nickname && <p className="text-xs text-gray-400 font-medium mb-3">{client.name}</p>}

                      <div className="bg-gray-50 rounded-xl w-full py-3 mt-2 border border-gray-100 group-hover:border-purple-100 transition-colors">
                          <div className="text-3xl font-black text-gray-800 tracking-tight flex items-center justify-center gap-1">
                              {client.totalVisits}
                              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">Visitas</span>
                          </div>
                      </div>

                      <button 
                          onClick={() => setRewardingClient(client)}
                          className="mt-4 w-full flex items-center justify-center gap-2 text-xs font-bold text-purple-700 bg-purple-50 px-4 py-3 rounded-xl border border-purple-100 hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 hover:text-white hover:border-transparent transition-all shadow-sm active:scale-95"
                      >
                          <Gift size={16} />
                          <span>Escolher Prêmio</span>
                      </button>
                 </div>
             ))}
          </div>
      ) : (
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trophy size={40} className="text-gray-300" />
              </div>
              <h3 className="text-lg font-bold text-gray-800">Nenhum cliente elegível</h3>
              <p className="text-gray-500 text-sm mt-2 max-w-xs mx-auto">
                  Ainda não há clientes que atingiram a meta de <b>{settings.serviceGoal} atendimentos</b>.
              </p>
          </div>
      )}
    </div>
  );
};