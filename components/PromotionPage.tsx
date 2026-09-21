
import React, { useState, useMemo } from 'react';
import { Plus, Tag, Calendar, Scissors, Layers, ShoppingBag, Trash2, MessageCircle, Users, Check, X, Search, CheckCircle2, DollarSign } from 'lucide-react';
import { Product, Client, Promotion } from '../types';

interface PromotionPageProps {
  products: Product[];
  clients: Client[];
  promotions: Promotion[];
  onSavePromotion: (promo: Promotion) => void;
  onDeletePromotion: (id: string) => void;
}

export const PromotionPage: React.FC<PromotionPageProps> = ({ products, clients, promotions, onSavePromotion, onDeletePromotion }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'SERVICE' | 'PACKAGE' | 'PRODUCT'>('SERVICE');
  
  // Form State
  const [selectedItemId, setSelectedItemId] = useState('');
  const [promoPrice, setPromoPrice] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [targetType, setTargetType] = useState<'ALL' | 'SPECIFIC'>('ALL');
  const [selectedClientIds, setSelectedClientIds] = useState<string[]>([]);
  const [searchItem, setSearchItem] = useState('');
  const [searchClient, setSearchClient] = useState('');

  const filteredItems = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchItem.toLowerCase());
      if (!matchesSearch) return false;
      
      if (activeTab === 'PRODUCT') return p.type === 'PRODUCT';
      if (activeTab === 'PACKAGE') return p.subtype === 'PACKAGE';
      return p.type === 'SERVICE' && p.subtype !== 'PACKAGE';
    });
  }, [products, activeTab, searchItem]);

  const filteredClients = useMemo(() => {
    return clients.filter(c => 
      c.name.toLowerCase().includes(searchClient.toLowerCase()) || 
      c.nickname.toLowerCase().includes(searchClient.toLowerCase())
    );
  }, [clients, searchClient]);

  const resetForm = () => {
    setSelectedItemId('');
    setPromoPrice('');
    setExpiryDate('');
    setTargetType('ALL');
    setSelectedClientIds([]);
    setSearchItem('');
    setIsFormOpen(false);
  };

  const handleSave = () => {
    const newPromo: Promotion = {
      id: Date.now().toString(),
      companyId: products[0]?.companyId || '1',
      itemId: selectedItemId,
      itemType: activeTab,
      promoPrice: parseFloat(promoPrice),
      expiryDate,
      targetClientIds: targetType === 'ALL' ? [] : selectedClientIds,
      active: true
    };
    onSavePromotion(newPromo);
    resetForm();
  };

  const sendWhatsAppPromos = (promo: Promotion) => {
    const item = products.find(p => p.id === promo.itemId);
    if (!item) return;

    const promoDate = new Date(promo.expiryDate + 'T12:00:00').toLocaleDateString('pt-BR');
    const msg = `🔥 *OFERTA IMPERDÍVEL!* 🔥\n\nAproveite: *${item.name}* de ~R$ ${item.price.toFixed(2)}~ por apenas *R$ ${promo.promoPrice.toFixed(2)}*.\n\n⏳ Válido até: ${promoDate}\n\nAgende agora mesmo pelo nosso app!`;

    const targetIds = promo.targetClientIds.length > 0 ? promo.targetClientIds : clients.map(c => c.id);
    const targetClients = clients.filter(c => targetIds.includes(c.id));

    targetClients.forEach(c => {
      const phone = c.whatsapp.replace(/\D/g, '');
      const finalPhone = phone.length <= 11 && !phone.startsWith('55') ? `55${phone}` : phone;
      window.open(`https://wa.me/${finalPhone}?text=${encodeURIComponent(msg)}`, '_blank');
    });
  };

  const activePromotions = useMemo(() => {
    const today = new Date().toLocaleDateString('en-CA');
    return promotions.filter(p => p.expiryDate >= today && p.active);
  }, [promotions]);

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-1 flex items-center gap-2">
            <Tag className="text-purple-600" /> Promoções
          </h2>
          <p className="text-gray-400">Lance ofertas especiais para seus clientes.</p>
        </div>
        <button 
          onClick={() => setIsFormOpen(true)}
          className="bg-purple-600 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-purple-700 transition-all flex items-center gap-2 shadow-lg"
        >
          <Plus size={18} /> Nova Promoção
        </button>
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
              <h3 className="text-xl font-bold text-gray-800">Criar Nova Promoção</h3>
              <button onClick={resetForm} className="p-2 hover:bg-gray-100 rounded-full"><X /></button>
            </div>
            
            <div className="p-8 space-y-6">
              {/* Type Tabs */}
              <div className="flex bg-gray-100 p-1 rounded-xl">
                <button onClick={() => { setActiveTab('SERVICE'); setSelectedItemId(''); }} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'SERVICE' ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-500'}`}>Serviços</button>
                <button onClick={() => { setActiveTab('PACKAGE'); setSelectedItemId(''); }} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'PACKAGE' ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-500'}`}>Pacotes</button>
                <button onClick={() => { setActiveTab('PRODUCT'); setSelectedItemId(''); }} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'PRODUCT' ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-500'}`}>Loja</button>
              </div>

              {/* Item Selection List (Replacement for Dropdown) */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-3">Selecione o Item para Promoção</label>
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input 
                    type="text" 
                    placeholder="Filtrar itens..." 
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                    value={searchItem}
                    onChange={(e) => setSearchItem(e.target.value)}
                  />
                </div>
                <div className="max-h-60 overflow-y-auto border border-gray-100 rounded-xl p-2 space-y-2 bg-gray-50/50 custom-scrollbar">
                  {filteredItems.length > 0 ? filteredItems.map(item => {
                    const isSelected = selectedItemId === item.id;
                    return (
                      <div 
                        key={item.id} 
                        onClick={() => setSelectedItemId(item.id)}
                        className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all border-2 ${isSelected ? 'border-purple-600 bg-white shadow-md' : 'border-transparent bg-white hover:bg-gray-50'}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden shrink-0 flex items-center justify-center">
                            {item.image ? (
                              <img src={item.image} className="w-full h-full object-cover" />
                            ) : (
                              <div className="text-gray-400">
                                {activeTab === 'SERVICE' ? <Scissors size={20} /> : activeTab === 'PACKAGE' ? <Layers size={20} /> : <ShoppingBag size={20} />}
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-gray-800 text-sm leading-tight">{item.name}</div>
                            <div className="text-xs text-gray-400 mt-1 font-medium">Original: R$ {item.price.toFixed(2)}</div>
                          </div>
                        </div>
                        {isSelected && <CheckCircle2 size={20} className="text-purple-600" />}
                      </div>
                    )
                  }) : (
                    <div className="text-center py-8 text-gray-400 text-sm italic">Nenhum item encontrado nesta categoria.</div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Preço Promocional (R$)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input 
                      type="number" 
                      value={promoPrice} 
                      onChange={(e) => setPromoPrice(e.target.value)}
                      className="w-full pl-10 p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-200 outline-none font-bold text-purple-600"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Data Término</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input 
                      type="date" 
                      value={expiryDate} 
                      onChange={(e) => setExpiryDate(e.target.value)}
                      min={new Date().toLocaleDateString('en-CA')}
                      className="w-full pl-10 p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-200 outline-none font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Target Clients */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-4">Público Alvo</label>
                <div className="flex gap-3 mb-4">
                  <button onClick={() => setTargetType('ALL')} className={`flex-1 py-3 rounded-xl border-2 font-bold text-sm transition-all ${targetType === 'ALL' ? 'border-purple-600 bg-purple-50 text-purple-700' : 'border-gray-100 text-gray-400'}`}>Todos os Clientes</button>
                  <button onClick={() => setTargetType('SPECIFIC')} className={`flex-1 py-3 rounded-xl border-2 font-bold text-sm transition-all ${targetType === 'SPECIFIC' ? 'border-purple-600 bg-purple-50 text-purple-700' : 'border-gray-100 text-gray-400'}`}>Clientes Específicos</button>
                </div>

                {targetType === 'SPECIFIC' && (
                  <div className="space-y-3 animate-in fade-in duration-300">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <input 
                        type="text" 
                        placeholder="Buscar cliente..." 
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                        value={searchClient}
                        onChange={(e) => setSearchClient(e.target.value)}
                      />
                    </div>
                    <div className="max-h-40 overflow-y-auto border border-gray-100 rounded-xl p-2 space-y-1 bg-gray-50 custom-scrollbar">
                      {filteredClients.map(c => {
                        const isSelected = selectedClientIds.includes(c.id);
                        return (
                          <div 
                            key={c.id} 
                            onClick={() => setSelectedClientIds(prev => isSelected ? prev.filter(id => id !== c.id) : [...prev, c.id])}
                            className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all ${isSelected ? 'bg-purple-50' : 'bg-white hover:bg-gray-50'}`}
                          >
                            <div className="flex items-center gap-2">
                              <img src={c.avatar || `https://ui-avatars.com/api/?name=${c.name}`} className="w-6 h-6 rounded-full" />
                              <span className="text-sm font-medium">{c.nickname || c.name}</span>
                            </div>
                            {isSelected && <Check size={16} className="text-purple-600" />}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 bg-gray-50 border-t border-gray-100">
              <button 
                onClick={handleSave}
                disabled={!selectedItemId || !promoPrice || !expiryDate}
                className="w-full py-4 bg-purple-600 text-white font-bold rounded-2xl shadow-lg hover:bg-purple-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 size={20} /> Salvar e Ativar Promoção
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Promotions List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activePromotions.map(promo => {
          const item = products.find(p => p.id === promo.itemId);
          if (!item) return null;
          return (
            <div key={promo.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden relative flex flex-col">
              <div className="absolute top-0 right-0 bg-purple-600 text-white px-3 py-1 rounded-bl-xl text-[10px] font-bold uppercase tracking-widest z-10">Promo Ativa</div>
              <div className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className={`p-3 rounded-2xl ${item.type === 'SERVICE' ? (item.subtype === 'PACKAGE' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600') : 'bg-orange-100 text-orange-600'}`}>
                    {item.type === 'SERVICE' ? (item.subtype === 'PACKAGE' ? <Layers size={24} /> : <Scissors size={24} />) : <ShoppingBag size={24} />}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-gray-900 truncate">{item.name}</h4>
                    <p className="text-xs text-gray-400 font-medium">Validade: {new Date(promo.expiryDate + 'T12:00:00').toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between bg-gray-50 p-4 rounded-2xl mb-4 border border-gray-100">
                  <div>
                    <span className="text-[10px] text-gray-400 font-bold uppercase block">Preço Original</span>
                    <span className="text-sm font-bold text-gray-400 line-through">R$ {item.price.toFixed(2)}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-purple-400 font-bold uppercase block">Preço Promo</span>
                    <span className="text-xl font-black text-purple-600">R$ {promo.promoPrice.toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs font-bold text-gray-500 mb-6">
                  <Users size={14} />
                  <span>{promo.targetClientIds.length > 0 ? `${promo.targetClientIds.length} Clientes Selecionados` : 'Todos os Clientes'}</span>
                </div>

                <div className="flex gap-2 mt-auto">
                  <button 
                    onClick={() => sendWhatsAppPromos(promo)}
                    className="flex-1 py-3 bg-emerald-500 text-white font-bold rounded-xl text-xs hover:bg-emerald-600 transition-all flex items-center justify-center gap-2"
                  >
                    <MessageCircle size={16} /> WhatsApp
                  </button>
                  <button 
                    onClick={() => onDeletePromotion(promo.id)}
                    className="p-3 bg-red-50 text-red-500 hover:bg-red-100 rounded-xl transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          )
        })}
        {activePromotions.length === 0 && (
          <div className="col-span-full py-20 bg-white rounded-3xl border-2 border-dashed border-gray-100 text-center">
            <Tag size={48} className="mx-auto mb-4 opacity-10" />
            <h3 className="text-lg font-bold text-gray-400">Nenhuma promoção ativa</h3>
            <p className="text-sm text-gray-300 mt-1">Crie sua primeira oferta clicando no botão acima.</p>
          </div>
        )}
      </div>
    </div>
  );
};
