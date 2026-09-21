import React, { useState, useMemo } from 'react';
import { X, Gift, Calendar, CheckCircle2, MessageCircle, Percent, Search, Package, Scissors, Layers } from 'lucide-react';
import { Client, Product } from '../types';

interface LoyaltyRewardModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client | null;
  products: Product[]; // Services, Packages, Products
  onRegisterRedemption?: (data: any) => void;
}

export const LoyaltyRewardModal: React.FC<LoyaltyRewardModalProps> = ({ isOpen, onClose, client, products, onRegisterRedemption }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<Product | null>(null);
  const [isFree, setIsFree] = useState(true); // Gratuidade vs Desconto
  const [discountPercent, setDiscountPercent] = useState<number>(10);
  const [expiryDate, setExpiryDate] = useState('');

  // Reset state on open
  React.useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
      setSelectedItem(null);
      setIsFree(true);
      setDiscountPercent(10);
      setExpiryDate('');
    }
  }, [isOpen]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm]);

  const handleNotify = () => {
    if (!client || !selectedItem || !expiryDate) return;

    const cleanPhone = client.whatsapp.replace(/\D/g, '');
    const finalPhone = cleanPhone.length <= 11 && !cleanPhone.startsWith('55') ? `55${cleanPhone}` : cleanPhone;
    
    const rewardText = isFree ? 'GRATUITO' : `${discountPercent}% DE DESCONTO`;
    const dateStr = new Date(expiryDate + 'T12:00:00').toLocaleDateString('pt-BR');

    // Register in system
    if (onRegisterRedemption) {
        onRegisterRedemption({
            clientId: client.id,
            clientName: client.nickname || client.name,
            clientAvatar: client.avatar,
            productId: selectedItem.id,
            productName: selectedItem.name,
            originalPrice: selectedItem.price,
            discountPercent: isFree ? 100 : discountPercent,
            expiryDate: expiryDate,
        });
    }

    const message = `Olá *${client.nickname || client.name}*! 🎉\n\n` +
      `Parabéns! Você completou seu cartão fidelidade no *Gendly App*.\n\n` +
      `🎁 *SEU PRÊMIO:* ${selectedItem.name}\n` +
      `💲 *CONDIÇÃO:* ${rewardText}\n` +
      `📅 *VÁLIDO ATÉ:* ${dateStr}\n\n` +
      `Agende seu horário e venha aproveitar!`;

    const url = `https://wa.me/${finalPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
    onClose();
  };

  if (!isOpen || !client) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-purple-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white relative overflow-hidden shrink-0">
           <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
           <div className="flex justify-between items-start relative z-10">
              <div className="flex items-center gap-3">
                 <div className="bg-white/20 p-2.5 rounded-xl backdrop-blur-md">
                    <Gift size={24} />
                 </div>
                 <div>
                    <h2 className="text-xl font-bold">Resgatar Prêmio</h2>
                    <p className="text-purple-100 text-xs font-medium">Defina a recompensa para {client.nickname || client.name}</p>
                 </div>
              </div>
              <button onClick={onClose} className="bg-white/20 p-1.5 rounded-full hover:bg-white/30 transition-colors">
                 <X size={20} />
              </button>
           </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
           
           {/* 1. Select Reward */}
           <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">1. Escolha o Prêmio</label>
              
              {!selectedItem ? (
                  <div className="space-y-3">
                      <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                          <input 
                              type="text" 
                              placeholder="Buscar serviço, produto ou pacote..." 
                              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-200 text-sm"
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              autoFocus
                          />
                      </div>
                      <div className="max-h-40 overflow-y-auto border border-gray-100 rounded-xl">
                          {filteredProducts.length > 0 ? (
                              filteredProducts.map(p => (
                                  <button 
                                    key={p.id}
                                    onClick={() => setSelectedItem(p)}
                                    className="w-full flex items-center gap-3 p-3 hover:bg-purple-50 transition-colors text-left border-b border-gray-50 last:border-0"
                                  >
                                      <div className={`p-2 rounded-lg shrink-0 ${p.type === 'SERVICE' ? (p.subtype === 'PACKAGE' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600') : 'bg-orange-100 text-orange-600'}`}>
                                          {p.type === 'SERVICE' ? (p.subtype === 'PACKAGE' ? <Layers size={16} /> : <Scissors size={16} />) : <Package size={16} />}
                                      </div>
                                      <div className="min-w-0">
                                          <div className="font-bold text-gray-800 text-sm truncate">{p.name}</div>
                                          <div className="text-xs text-gray-400">R$ {p.price.toFixed(2)}</div>
                                      </div>
                                  </button>
                              ))
                          ) : (
                              <div className="p-4 text-center text-xs text-gray-400">Nenhum item encontrado.</div>
                          )}
                      </div>
                  </div>
              ) : (
                  <div className="flex items-center justify-between bg-purple-50 p-3 rounded-xl border border-purple-100">
                      <div className="flex items-center gap-3 min-w-0">
                          <div className="bg-white p-2 rounded-lg text-purple-600 shadow-sm">
                              <CheckCircle2 size={20} />
                          </div>
                          <div className="min-w-0">
                              <div className="font-bold text-gray-800 text-sm truncate">{selectedItem.name}</div>
                              <div className="text-xs text-purple-500 font-bold">R$ {selectedItem.price.toFixed(2)}</div>
                          </div>
                      </div>
                      <button onClick={() => setSelectedItem(null)} className="text-xs font-bold text-gray-400 hover:text-red-500 underline px-2">
                          Alterar
                      </button>
                  </div>
              )}
           </div>

           {/* 2. Define Condition */}
           <div className={`transition-opacity duration-300 ${selectedItem ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">2. Condição do Prêmio</label>
              <div className="flex gap-2 mb-4">
                  <button 
                    onClick={() => setIsFree(true)}
                    className={`flex-1 py-3 rounded-xl border-2 font-bold text-sm transition-all ${isFree ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-100 text-gray-400 hover:bg-gray-50'}`}
                  >
                      Gratuidade (100%)
                  </button>
                  <button 
                    onClick={() => setIsFree(false)}
                    className={`flex-1 py-3 rounded-xl border-2 font-bold text-sm transition-all ${!isFree ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-100 text-gray-400 hover:bg-gray-50'}`}
                  >
                      Desconto %
                  </button>
              </div>

              {!isFree && (
                  <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-xl border border-gray-200">
                      <Percent size={18} className="text-gray-400" />
                      <input 
                        type="number" 
                        value={discountPercent}
                        onChange={(e) => setDiscountPercent(Number(e.target.value))}
                        className="bg-transparent w-full outline-none font-bold text-gray-800"
                        placeholder="Ex: 50"
                      />
                      <span className="text-sm font-bold text-gray-400">% OFF</span>
                  </div>
              )}
           </div>

           {/* 3. Expiration */}
           <div className={`transition-opacity duration-300 ${selectedItem ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">3. Validade do Prêmio</label>
              <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-200 font-bold text-gray-700"
                  />
              </div>
           </div>

        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50 border-t border-gray-100 shrink-0">
            <button 
                onClick={handleNotify}
                disabled={!selectedItem || !expiryDate}
                className="w-full py-4 rounded-xl bg-emerald-500 text-white font-bold text-lg shadow-lg shadow-emerald-200 hover:bg-emerald-600 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                <MessageCircle size={20} />
                Avisar Cliente
            </button>
        </div>

      </div>
    </div>
  );
};