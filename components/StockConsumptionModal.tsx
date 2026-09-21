
import React, { useState, useMemo } from 'react';
import { X, Package, Search, Plus, Minus, CheckCircle2, ChevronRight, ArrowRight, AlertCircle, Users, Box, SkipForward, Zap } from 'lucide-react';
import { Product, Category } from '../types';

interface StockConsumptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (consumedItems: { productId: string; quantity: number }[]) => void;
  products: Product[];
  categories: Category[];
}

export const StockConsumptionModal: React.FC<StockConsumptionModalProps> = ({ isOpen, onClose, onConfirm, products, categories }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [consumption, setConsumption] = useState<Record<string, number>>({});

  const inventoryItems = useMemo(() => {
    return products.filter(p => 
      p.type === 'PRODUCT' && 
      (p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [products, searchTerm]);

  const updateQty = (id: string, delta: number) => {
    setConsumption(prev => {
      const current = prev[id] || 0;
      const next = Math.max(0, current + delta); 
      if (next === 0) {
        const { [id]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [id]: next };
    });
  };

  const consumedCount = Object.keys(consumption).length;

  const handleConfirm = () => {
    const items = Object.entries(consumption).map(([productId, quantity]) => ({
      productId,
      quantity
    }));
    onConfirm(items);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh] border border-blue-100">
        
        <div className="bg-blue-600 p-6 text-white relative overflow-hidden shrink-0">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
          <div className="relative z-10 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2.5 rounded-xl backdrop-blur-md">
                <Package size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold leading-tight">Materiais do Atendimento</h2>
                <p className="text-blue-100 text-[10px] font-bold uppercase tracking-widest">Informe o uso para baixa automática</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 hover:bg-white/20 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-3 bg-gray-50 border-b border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Buscar material no estoque..." 
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 text-xs shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
          {inventoryItems.length > 0 ? (
            inventoryItems.map(item => {
              const cat = categories.find(c => c.id === item.categoryId);
              const hasSelection = (consumption[item.id] || 0) > 0;
              const potentialServings = cat ? Math.floor(item.quantity * cat.peopleCount) : 0;
              
              return (
                <div key={item.id} className={`p-3 rounded-2xl border transition-all flex items-center justify-between ${hasSelection ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-100' : 'bg-white border-gray-100 hover:border-gray-200'}`}>
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-16 h-16 rounded-xl bg-gray-100 shrink-0 overflow-hidden border border-gray-100 shadow-sm">
                      {item.image ? <img src={item.image} className="w-full h-full object-cover" /> : <Package className="text-gray-300 m-auto mt-4" size={24} />}
                    </div>
                    
                    <div className="min-w-0">
                      <div className="font-black text-gray-800 text-sm truncate leading-tight">{item.name}</div>
                      <div className="flex flex-col gap-1 mt-1">
                        <div className="flex items-center gap-2">
                            <span className="text-[9px] font-bold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded uppercase">Estoque: {Math.floor(item.quantity)} un</span>
                            {cat && (
                              <span className="text-[9px] font-bold text-blue-600 bg-blue-100/50 px-1.5 py-0.5 rounded uppercase">Rende: {cat.peopleCount} p.</span>
                            )}
                        </div>
                        {cat && (
                            <div className="flex items-center gap-1 text-emerald-600 font-black text-[9px] uppercase">
                                <Zap size={10} fill="currentColor" />
                                {potentialServings} atendimentos restantes
                            </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center bg-white rounded-xl border border-gray-200 p-1 shadow-sm ml-4">
                    <button 
                      onClick={() => updateQty(item.id, -1)}
                      className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Minus size={16} strokeWidth={3} />
                    </button>
                    <div className="flex flex-col items-center justify-center min-w-[3rem]">
                        <span className="font-black text-sm text-gray-700 leading-none">
                            {consumption[item.id] || 0}
                        </span>
                        <span className="text-[7px] font-black text-gray-400 uppercase">Usos</span>
                    </div>
                    <button 
                      onClick={() => updateQty(item.id, 1)}
                      className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-lg transition-colors"
                    >
                      <Plus size={16} strokeWidth={3} />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-12 text-gray-400">
              <Box size={40} className="mx-auto mb-2 opacity-10" />
              <p className="text-xs font-bold uppercase tracking-widest">Nenhum material no estoque</p>
            </div>
          )}
        </div>

        <div className="p-6 bg-gray-50 border-t border-gray-100 space-y-3">
          <button 
            onClick={handleConfirm}
            className={`w-full py-4 rounded-2xl font-black text-sm shadow-lg transition-all flex items-center justify-center gap-2 active:scale-[0.98] ${
                consumedCount > 0 
                ? 'bg-blue-600 text-white shadow-blue-200 hover:bg-blue-700' 
                : 'bg-white border-2 border-gray-200 text-gray-500 hover:bg-gray-100 shadow-none'
            }`}
          >
            {consumedCount > 0 ? (
              <>
                <CheckCircle2 size={20} />
                <span>BAIXAR {consumedCount} ITENS E PAGAR</span>
              </>
            ) : (
              <>
                <SkipForward size={20} />
                <span>NÃO UTILIZEI MATERIAIS</span>
              </>
            )}
          </button>
          <p className="text-[10px] text-center text-gray-400 font-bold uppercase tracking-widest">A baixa será proporcional ao rendimento da categoria</p>
        </div>
      </div>
    </div>
  );
};
