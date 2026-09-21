
import React, { useState } from 'react';
import { X, HelpCircle, ArrowLeft, MessageCircle, Check, Zap, Sparkles, Crown, Briefcase, Users, DollarSign, Package, Heart, Tag, Settings, Scissors, LayoutDashboard, Calendar, ShoppingBag, ListOrdered, QrCode } from 'lucide-react';
import { PlanType } from '../types';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan: PlanType;
}

type HelpView = 'OVERVIEW' | 'CHANGE_PLAN' | 'QUESTIONS';

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose, currentPlan }) => {
  const [view, setView] = useState<HelpView>('OVERVIEW');

  if (!isOpen) return null;

  const handleBack = () => setView('OVERVIEW');

  const plans = [
    { id: 'ESSENTIAL', name: 'Essencial', price: '14,99', color: 'text-blue-600', bg: 'bg-blue-50' },
    { id: 'PROFESSIONAL', name: 'Profissional', price: '24,99', color: 'text-purple-600', bg: 'bg-purple-50' },
    { id: 'PREMIUM', name: 'Premium', price: '32,99', color: 'text-emerald-600', bg: 'bg-emerald-50' },
  ];

  const categories = [
    { name: 'Painel Central', icon: LayoutDashboard, color: 'text-indigo-500' },
    { name: 'Agendamento', icon: Calendar, color: 'text-blue-500' },
    { name: 'Cliente', icon: Users, color: 'text-sky-500' },
    { name: 'Serviços', icon: Scissors, color: 'text-purple-500' },
    { name: 'Profissional', icon: Briefcase, color: 'text-orange-500' },
    { name: 'Financeiro', icon: DollarSign, color: 'text-emerald-500' },
    { name: 'Loja', icon: ShoppingBag, color: 'text-pink-500' },
    { name: 'Estoque', icon: Package, color: 'text-amber-500' },
    { name: 'Fila de Espera', icon: ListOrdered, color: 'text-orange-600' },
    { name: 'Fidelidade', icon: Heart, color: 'text-rose-500' },
    { name: 'Promoções', icon: Tag, color: 'text-pink-500' },
    { name: 'Configurar PIX', icon: QrCode, color: 'text-cyan-600' },
    { name: 'Ajustes', icon: Settings, color: 'text-gray-500' },
  ];

  const handleCategoryClick = (cat: string) => {
    const msg = `Olá! Tenho uma dúvida sobre a funcionalidade de *${cat}* no Gendly.`;
    window.open(`https://wa.me/5500000000000?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handlePlanSelect = (plan: string) => {
    const msg = `Olá! Gostaria de alterar meu plano para o *${plan}*.`;
    window.open(`https://wa.me/5500000000000?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[85vh] border border-purple-100">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3">
            {view !== 'OVERVIEW' && (
              <button onClick={handleBack} className="p-1 -ml-1 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-full transition-all">
                <ArrowLeft size={20} />
              </button>
            )}
            <div className="bg-purple-100 p-2 rounded-xl text-purple-600">
              <HelpCircle size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Central de Ajuda</h2>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          
          {view === 'OVERVIEW' && (
            <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-3xl border border-purple-100 text-center">
                <div className="inline-block px-3 py-1 bg-white text-purple-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-2 shadow-sm border border-purple-50">
                  Seu Plano Atual
                </div>
                <h3 className="text-3xl font-black text-gray-900 tracking-tight flex items-center justify-center gap-2">
                  {currentPlan === 'ESSENTIAL' ? 'Essencial' : currentPlan === 'PROFESSIONAL' ? 'Profissional' : 'Premium'}
                  {currentPlan === 'PREMIUM' && <Crown size={24} className="text-yellow-500 fill-yellow-400" />}
                </h3>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <button 
                  onClick={() => setView('CHANGE_PLAN')}
                  className="group flex items-center justify-between p-5 bg-white border border-gray-100 rounded-2xl hover:border-purple-300 hover:shadow-lg transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Zap size={24} fill="currentColor" />
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-gray-800">Alterar de Plano</div>
                      <div className="text-xs text-gray-400">Turbine suas funcionalidades</div>
                    </div>
                  </div>
                  <Sparkles size={20} className="text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>

                <button 
                  onClick={() => setView('QUESTIONS')}
                  className="group flex items-center justify-between p-5 bg-white border border-gray-100 rounded-2xl hover:border-pink-300 hover:shadow-lg transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-pink-50 text-pink-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <MessageCircle size={24} />
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-gray-800">Dúvidas sobre o Gendly</div>
                      <div className="text-xs text-gray-400">Precisa de suporte técnico?</div>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {view === 'CHANGE_PLAN' && (
            <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
              <h3 className="font-bold text-gray-800 mb-4 text-center">Escolha seu novo plano</h3>
              {plans.map((p) => (
                <button 
                  key={p.id}
                  onClick={() => handlePlanSelect(p.name)}
                  className={`w-full p-4 rounded-2xl border-2 transition-all flex items-center justify-between ${
                    p.id === currentPlan 
                    ? 'border-purple-500 bg-purple-50 ring-4 ring-purple-50' 
                    : 'border-gray-100 hover:border-purple-200 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl ${p.bg} ${p.color} flex items-center justify-center`}>
                      {p.id === 'PREMIUM' ? <Crown size={20} /> : <Check size={20} strokeWidth={3} />}
                    </div>
                    <div className="text-left">
                      <div className="font-black text-gray-800">{p.name}</div>
                      <div className="text-xs text-gray-400">R$ {p.price}/mês</div>
                    </div>
                  </div>
                  {p.id === currentPlan && <span className="text-[8px] font-black uppercase text-purple-600 px-2 py-1 bg-white rounded-full border border-purple-100 shadow-sm">Atual</span>}
                </button>
              ))}
            </div>
          )}

          {view === 'QUESTIONS' && (
            <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
              <div className="text-center mb-6">
                <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Qual funcionalidade tem dúvidas?</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {categories.map((cat) => (
                  <button 
                    key={cat.name}
                    onClick={() => handleCategoryClick(cat.name)}
                    className="flex flex-col items-center gap-2 p-4 bg-gray-50 border border-gray-100 rounded-2xl hover:bg-white hover:border-purple-200 hover:shadow-md transition-all group"
                  >
                    <cat.icon className={`${cat.color} group-hover:scale-110 transition-transform`} size={24} />
                    <span className="text-xs font-bold text-gray-700">{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50 border-t border-gray-100 text-center">
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Suporte Gendly • Resposta em até 24h</p>
        </div>
      </div>
    </div>
  );
};
