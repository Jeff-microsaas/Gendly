import React, { useState, useEffect } from 'react';
import { 
  X, Sparkles, Clock, Calendar, DollarSign, QrCode, 
  Users, Scissors, Briefcase, ChevronRight, CheckCircle2, 
  ArrowLeft, Bot, Zap, Heart, Star, Tag, Layers, Trophy, PartyPopper, Info, ShoppingBag
} from 'lucide-react';
import { PlanType } from '../types';

interface AssistantOnboardingProps {
  isOpen: boolean;
  onClose: () => void;
  onCompleteSettings: (data: any) => void;
  onTriggerTask: (task: 'CLIENT' | 'SERVICE' | 'SPECIALTY' | 'PROFESSIONAL' | 'STORE_PRODUCT') => void;
  taskStep: number;
  currentPlan: PlanType;
}

export const AssistantOnboarding: React.FC<AssistantOnboardingProps> = ({ 
  isOpen, 
  onClose, 
  onCompleteSettings, 
  onTriggerTask,
  taskStep,
  currentPlan 
}) => {
  const [step, setStep] = useState(0);
  
  // State for onboarding data
  const [openingTime, setOpeningTime] = useState('09:00');
  const [closingTime, setClosingTime] = useState('19:00');
  const [interval, setInterval] = useState(30);
  const [alertTime, setAlertTime] = useState(10);
  
  const [pixKey, setPixKey] = useState('');
  const [maxInstallments, setMaxInstallments] = useState(12);
  const [interestRate, setInterestRate] = useState(0);
  const [interestStart, setInterestStart] = useState(13);

  // Sync internal step with taskStep once we reach step 3
  useEffect(() => {
    if (step >= 3 && step < 7) {
        if (taskStep === 5) setStep(7);
    }
  }, [taskStep, step]);

  if (!isOpen) return null;

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  const handleFinishSettings = () => {
    onCompleteSettings({
      openingTime,
      closingTime,
      schedulingInterval: interval,
      appointmentAlertTime: alertTime,
      pixKey,
      maxInstallments,
      interestRate,
      interestStart
    });
    nextStep();
  };

  const renderStep = () => {
    switch (step) {
      case 0: // Welcome
        return (
          <div className="space-y-6 text-center animate-in fade-in zoom-in duration-500">
            <div className="relative mx-auto w-24 h-24 mb-6">
                <div className="absolute inset-0 bg-purple-200 rounded-full animate-ping opacity-20"></div>
                <div className="relative bg-gradient-to-br from-purple-600 to-pink-600 w-full h-full rounded-full flex items-center justify-center text-white shadow-xl">
                    <Bot size={48} />
                </div>
            </div>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">Bem-vindo ao Gendly!</h2>
            <p className="text-gray-500 font-medium text-lg leading-relaxed">
              Olá! Sou seu assistente virtual. Vou te guiar na configuração rápida do seu negócio para você começar a faturar hoje mesmo.
            </p>
            <div className="bg-purple-50 p-4 rounded-2xl border border-purple-100 flex items-center gap-3 text-left">
                <Sparkles className="text-purple-600 shrink-0" />
                <p className="text-sm font-bold text-purple-700">Vamos configurar sua agenda e financeiro em menos de 2 minutos.</p>
            </div>
            <button 
              onClick={nextStep}
              className="w-full py-5 bg-gray-900 text-white rounded-2xl font-black text-lg shadow-xl hover:bg-black transition-all flex items-center justify-center gap-3 group"
            >
              VAMOS COMEÇAR
              <ChevronRight className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        );

      case 1: // Schedule
        return (
          <div className="space-y-6 animate-in slide-in-from-right duration-300">
            <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><Calendar size={20} /></div>
                <h3 className="text-xl font-bold text-gray-800">Agenda & Horários</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Hora de Abertura</label>
                    <input type="time" value={openingTime} onChange={e => setOpeningTime(e.target.value)} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-200 outline-none font-bold" />
                </div>
                <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Hora de Fechamento</label>
                    <input type="time" value={closingTime} onChange={e => setClosingTime(e.target.value)} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-200 outline-none font-bold" />
                </div>
            </div>
            <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Intervalo entre atendimentos</label>
                <select value={interval} onChange={e => setInterval(Number(e.target.value))} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-200 outline-none font-bold">
                    <option value={15}>15 minutos</option>
                    <option value={30}>30 minutos</option>
                    <option value={45}>45 minutos</option>
                    <option value={60}>1 hora</option>
                </select>
            </div>
            <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Alerta de início (minutos antes)</label>
                <input type="number" value={alertTime} onChange={e => setAlertTime(Number(e.target.value))} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-200 outline-none font-bold" placeholder="Ex: 10" />
            </div>
            <div className="flex gap-3 pt-4">
                <button onClick={prevStep} className="p-4 text-gray-400 font-bold hover:text-gray-600 transition-colors"><ArrowLeft /></button>
                <button onClick={nextStep} className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all flex items-center justify-center gap-2">
                    PRÓXIMO: FINANCEIRO <ChevronRight size={18} />
                </button>
            </div>
          </div>
        );

      case 2: // Financial
        return (
          <div className="space-y-6 animate-in slide-in-from-right duration-300">
            <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg"><DollarSign size={20} /></div>
                <h3 className="text-xl font-bold text-gray-800">Pagamento & Financeiro</h3>
            </div>
            <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Sua Chave Pix para Receber</label>
                <div className="relative">
                    <QrCode className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                    <input type="text" value={pixKey} onChange={e => setPixKey(e.target.value)} className="w-full p-4 pl-12 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-200 outline-none font-bold" placeholder="CPF, E-mail ou Telefone" />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Máx. Parcelas</label>
                    <input type="number" value={maxInstallments} onChange={e => setMaxInstallments(Number(e.target.value))} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none font-bold" />
                </div>
                <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Taxa de Juros (%)</label>
                    <input type="number" value={interestRate} onChange={e => setInterestRate(Number(e.target.value))} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none font-bold" />
                </div>
            </div>
            <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Cobrar juros a partir de qual parcela?</label>
                <input type="number" value={interestStart} onChange={e => setInterestStart(Number(e.target.value))} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none font-bold" />
            </div>
            <div className="flex gap-3 pt-4">
                <button onClick={prevStep} className="p-4 text-gray-400 font-bold hover:text-gray-600 transition-colors"><ArrowLeft /></button>
                <button onClick={handleFinishSettings} className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-black shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all flex items-center justify-center gap-2">
                    PRÓXIMO: LANÇAMENTOS <ChevronRight size={18} />
                </button>
            </div>
          </div>
        );

      case 3: // Instructions & Feeding System tasks
        return (
          <div className="space-y-4 animate-in slide-in-from-right duration-300">
            <div className="text-center mb-4">
                <div className="inline-flex p-3 bg-purple-100 text-purple-600 rounded-2xl mb-2"><Zap fill="currentColor" size={20} /></div>
                <h3 className="text-xl font-black text-gray-900 leading-tight">Hora de Alimentar o Sistema!</h3>
                <p className="text-[11px] text-gray-500">Realize seus primeiros cadastros para começar:</p>
            </div>
            
            <div className="space-y-2">
                {/* 1. Cliente */}
                <button 
                    onClick={() => taskStep === 0 && onTriggerTask('CLIENT')}
                    disabled={taskStep > 0}
                    className={`w-full flex items-center gap-3 p-3.5 rounded-2xl border transition-all text-left group ${
                        taskStep === 0 ? 'bg-white border-purple-200 shadow-md hover:border-purple-400' : 'bg-gray-50 border-gray-100 opacity-60'
                    }`}
                >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm ${
                        taskStep > 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-purple-100 text-purple-600'
                    }`}>
                        {taskStep > 0 ? <CheckCircle2 size={20} /> : '1'}
                    </div>
                    <div className="flex-1">
                        <div className="font-bold text-gray-800 text-xs flex items-center gap-2">
                            <Users size={12}/> {taskStep > 0 ? 'Cliente Cadastrado!' : 'Cadastre 1 Cliente'}
                        </div>
                    </div>
                    {taskStep === 0 && <ChevronRight size={16} className="text-purple-300 group-hover:translate-x-1 transition-transform" />}
                </button>

                {/* 2. Serviços */}
                <div className="space-y-1.5">
                    <button 
                        onClick={() => taskStep === 1 && onTriggerTask('SERVICE')}
                        disabled={taskStep < 1 || taskStep > 1}
                        className={`w-full flex items-center gap-3 p-3.5 rounded-2xl border transition-all text-left group ${
                            taskStep === 1 ? 'bg-white border-blue-200 shadow-md hover:border-blue-400' : 'bg-gray-50 border-gray-100 opacity-60'
                        }`}
                    >
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm ${
                            taskStep > 1 ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'
                        }`}>
                            {taskStep > 1 ? <CheckCircle2 size={20} /> : '2'}
                        </div>
                        <div className="flex-1">
                            <div className="font-bold text-gray-800 text-xs flex items-center gap-2">
                                <Scissors size={12}/> {taskStep > 1 ? 'Serviço Cadastrado!' : 'Cadastre seus Serviços'}
                            </div>
                        </div>
                        {taskStep === 1 && <ChevronRight size={16} className="text-blue-300 group-hover:translate-x-1 transition-transform" />}
                    </button>
                    {taskStep >= 2 && (
                        <div className="px-4 py-2 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-2 animate-in fade-in slide-in-from-top-1 duration-500">
                            <Info size={14} className="text-blue-500 shrink-0 mt-0.5" />
                            <p className="text-[10px] text-blue-700 font-medium leading-tight">
                                Para cadastrar mais serviços e pacotes futuramente, basta acessar o menu <b>Serviços</b> no painel lateral.
                            </p>
                        </div>
                    )}
                </div>

                {/* 3. Equipe (Specialty & Professional Combined) */}
                <div className="space-y-1.5">
                    <button 
                        onClick={() => (taskStep === 2) && onTriggerTask('SPECIALTY')}
                        disabled={taskStep < 2 || taskStep > 2}
                        className={`w-full flex items-center gap-3 p-3.5 rounded-2xl border transition-all text-left group ${
                            taskStep === 2 ? 'bg-white border-orange-200 shadow-md hover:border-orange-400' : 'bg-gray-50 border-gray-100 opacity-60'
                        }`}
                    >
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm ${
                            taskStep > 2 ? 'bg-emerald-100 text-emerald-600' : 'bg-orange-100 text-orange-600'
                        }`}>
                            {taskStep > 2 ? <CheckCircle2 size={20} /> : '3'}
                        </div>
                        <div className="flex-1">
                            <div className="font-bold text-gray-800 text-xs flex items-center gap-2">
                                <Tag size={12}/> {taskStep > 2 ? 'Especialidade OK!' : 'Cadastre Especialidades'}
                            </div>
                        </div>
                        {taskStep === 2 && <ChevronRight size={16} className="text-orange-300 group-hover:translate-x-1 transition-transform" />}
                    </button>

                    <button 
                        onClick={() => (taskStep === 3) && onTriggerTask('PROFESSIONAL')}
                        disabled={taskStep < 3 || taskStep > 3}
                        className={`w-full flex items-center gap-3 p-3.5 rounded-2xl border transition-all text-left group ${
                            taskStep === 3 ? 'bg-white border-orange-200 shadow-md hover:border-orange-400' : 'bg-gray-50 border-gray-100 opacity-60'
                        }`}
                    >
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm ${
                            taskStep > 3 ? 'bg-emerald-100 text-emerald-600' : 'bg-orange-100 text-orange-600'
                        }`}>
                            {taskStep > 3 ? <CheckCircle2 size={20} /> : '4'}
                        </div>
                        <div className="flex-1">
                            <div className="font-bold text-gray-800 text-xs flex items-center gap-2">
                                <Briefcase size={12}/> {taskStep > 3 ? 'Profissional OK!' : 'Cadastre o Profissional'}
                            </div>
                        </div>
                        {taskStep === 3 && <ChevronRight size={16} className="text-orange-300 group-hover:translate-x-1 transition-transform" />}
                    </button>
                </div>

                {/* 4. Loja (Somente Profissional/Premium) */}
                {currentPlan !== 'ESSENTIAL' && (
                    <button 
                        onClick={() => taskStep === 4 && onTriggerTask('STORE_PRODUCT')}
                        disabled={taskStep < 4 || taskStep > 4}
                        className={`w-full flex items-center gap-3 p-3.5 rounded-2xl border transition-all text-left group ${
                            taskStep === 4 ? 'bg-white border-emerald-200 shadow-md hover:border-emerald-400' : 'bg-gray-50 border-gray-100 opacity-60'
                        }`}
                    >
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm ${
                            taskStep > 4 ? 'bg-emerald-100 text-emerald-600' : 'bg-emerald-100 text-emerald-600'
                        }`}>
                            {taskStep > 4 ? <CheckCircle2 size={20} /> : '5'}
                        </div>
                        <div className="flex-1">
                            <div className="font-bold text-gray-800 text-xs flex items-center gap-2">
                                <ShoppingBag size={12}/> {taskStep > 4 ? 'Produto Cadastrado!' : 'Cadastre Produto na Loja'}
                            </div>
                        </div>
                        {taskStep === 4 && <ChevronRight size={16} className="text-emerald-300 group-hover:translate-x-1 transition-transform" />}
                    </button>
                )}
            </div>

            {((currentPlan === 'ESSENTIAL' && taskStep >= 4) || (currentPlan !== 'ESSENTIAL' && taskStep >= 5)) && (
                 <button 
                    onClick={nextStep} 
                    className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-black shadow-xl shadow-purple-100 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 animate-bounce mt-4"
                >
                    TUDO PRONTO! CONTINUAR <ChevronRight size={22} />
                </button>
            )}
          </div>
        );

      case 7: // Final Congratulations
        return (
          <div className="space-y-6 text-center animate-in fade-in zoom-in duration-700">
            <div className="relative mx-auto w-32 h-32 mb-6">
                <div className="absolute inset-0 bg-yellow-400/20 rounded-full animate-ping"></div>
                <div className="relative bg-gradient-to-br from-yellow-400 to-orange-500 w-full h-full rounded-full flex items-center justify-center text-white shadow-xl">
                    <Trophy size={64} fill="currentColor" />
                </div>
                <div className="absolute -top-2 -right-2 text-pink-500 animate-bounce">
                    <PartyPopper size={32} />
                </div>
            </div>
            
            <div className="space-y-2">
                <h2 className="text-4xl font-black text-gray-900 tracking-tighter">Parabéns!</h2>
                <p className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                    Sua jornada no Gendly começou.
                </p>
            </div>

            <p className="text-gray-500 font-medium leading-relaxed px-4 text-sm">
                Com esses cadastros básicos, você já pode realizar agendamentos, vender serviços e controlar seu financeiro com total facilidade.
            </p>

            <div className="bg-emerald-50 p-5 rounded-3xl border border-emerald-100 flex items-center gap-4 text-left">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-emerald-500 shadow-sm shrink-0">
                    <Heart size={24} fill="currentColor" />
                </div>
                <p className="text-sm font-bold text-emerald-800">Seu negócio acaba de ganhar superpoderes digitais!</p>
            </div>

            <button 
              onClick={onClose}
              className="w-full py-5 bg-gray-900 text-white rounded-2xl font-black text-xl shadow-2xl hover:bg-black hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
            >
              IR PARA O PAINEL
              <ChevronRight size={24} />
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-[350] flex items-center justify-center bg-gray-900/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-lg p-10 relative border border-white/20">
        <button onClick={onClose} className="absolute top-6 right-6 p-2 text-gray-300 hover:text-gray-500 hover:bg-gray-100 rounded-full transition-all">
          <X size={24} />
        </button>
        {renderStep()}
        
        {/* Progress Dots */}
        <div className="flex justify-center gap-2 mt-8">
            {[0, 1, 2, 3, 7].map((i, idx) => (
                <div key={i} className={`h-1.5 transition-all duration-300 rounded-full ${step === i ? 'w-8 bg-purple-600' : 'w-2 bg-gray-200'}`} />
            ))}
        </div>
      </div>
    </div>
  );
};