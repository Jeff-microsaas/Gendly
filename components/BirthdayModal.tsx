import React from 'react';
import { X, Cake, MessageCircle, Gift, Star, Check } from 'lucide-react';
import { Client } from '../types';

interface BirthdayModalProps {
  isOpen: boolean;
  onClose: () => void;
  birthdayClients: Client[];
  companyName: string;
  congratulatedIds: string[];
  onCongratulate: (id: string) => void;
}

export const BirthdayModal: React.FC<BirthdayModalProps> = ({ 
  isOpen, 
  onClose, 
  birthdayClients, 
  companyName, 
  congratulatedIds, 
  onCongratulate 
}) => {
  if (!isOpen) return null;

  const handleCongratulateAction = (client: Client) => {
    const cleanPhone = client.whatsapp.replace(/\D/g, '');
    const finalPhone = cleanPhone.length <= 11 && !cleanPhone.startsWith('55') ? `55${cleanPhone}` : cleanPhone;
    
    const message = `Olá *${client.nickname || client.name}*! 🎉🎂\n\nNós da *${companyName}* passamos para te desejar um feliz aniversário! Que seu dia seja repleto de alegria, saúde e muita beleza. Esperamos te ver em breve para comemorar!\n\nParabéns! ✨`;
    
    const url = `https://wa.me/${finalPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
    onCongratulate(client.id);
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[85vh] border border-pink-100">
        
        {/* Header Festivo */}
        <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-8 text-white relative overflow-hidden shrink-0">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/5 rounded-full blur-xl -ml-8 -mb-8"></div>
          
          <div className="relative z-10 flex justify-between items-start">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md shadow-inner">
                <Cake size={32} strokeWidth={2.5} />
              </div>
              <div>
                <h2 className="text-2xl font-black tracking-tight">Aniversariantes</h2>
                <p className="text-pink-100 text-sm font-medium">Clientes especiais do dia!</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Lista de Aniversariantes */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-gray-50/50">
          {birthdayClients.length > 0 ? (
            birthdayClients.map((client) => {
              const isCongratulated = congratulatedIds.includes(client.id);
              return (
                <div key={client.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-all group">
                  <div className="relative shrink-0">
                    <div className="absolute inset-0 bg-gradient-to-tr from-pink-400 to-purple-400 rounded-full blur-sm opacity-0 group-hover:opacity-40 transition-opacity"></div>
                    {client.avatar ? (
                      <img src={client.avatar} alt={client.name} className="relative w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm z-10" />
                    ) : (
                      <div className="relative w-14 h-14 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center font-bold text-xl border-2 border-white shadow-sm z-10">
                        {client.name.charAt(0)}
                      </div>
                    )}
                    <div className="absolute -top-1 -right-1 bg-yellow-400 text-white p-1 rounded-full border-2 border-white z-20 animate-bounce">
                      <Gift size={10} fill="currentColor" />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-800 truncate leading-tight">{client.nickname || client.name}</h3>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-[10px] font-black text-pink-500 uppercase tracking-widest bg-pink-50 px-2 py-0.5 rounded">Hoje!</span>
                    </div>
                  </div>

                  <button 
                    onClick={() => handleCongratulateAction(client)}
                    disabled={isCongratulated}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 active:scale-95 shrink-0 ${
                      isCongratulated 
                      ? 'bg-gray-100 text-gray-400 cursor-default border border-gray-200' 
                      : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-100'
                    }`}
                  >
                    {isCongratulated ? (
                      <>
                        <Check size={14} strokeWidth={3} />
                        <span>Parabenizado</span>
                      </>
                    ) : (
                      <>
                        <MessageCircle size={14} fill="currentColor" />
                        <span>Parabenizar</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })
          ) : (
            <div className="text-center py-12 px-6">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star size={40} className="text-gray-300" />
              </div>
              <h3 className="text-lg font-bold text-gray-700">Nenhum para hoje</h3>
              <p className="text-sm text-gray-400 mt-2">Os aniversariantes aparecem aqui apenas na data correta.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 bg-white border-t border-gray-100 text-center">
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Gendly • Gestão de Relacionamento</p>
        </div>
      </div>
    </div>
  );
};