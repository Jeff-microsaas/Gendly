
import React from 'react';
import { X, CheckCircle2, Clock, Layers, Scissors, CalendarPlus, RotateCw, CreditCard, AlertTriangle } from 'lucide-react';
import { Appointment } from '../types';

interface InServiceModalProps {
  appointment: Appointment | null;
  isOpen: boolean;
  onClose: () => void; // Mantido para funcionalidade interna/backdrop se necessário
  onFinish: (mode?: 'PAY_NOW') => void; // "FINALIZADO" behavior
  packageInfo?: { 
      current: number; 
      total: number; 
      paymentStatus?: 'PAID' | 'PENDING' | 'NONE'; 
      dueDate?: string; 
  } | null;
  onScheduleNext: () => void;
  onRenew?: () => void; 
}

export const InServiceModal: React.FC<InServiceModalProps> = ({ appointment, isOpen, onClose, onFinish, packageInfo, onScheduleNext, onRenew }) => {
  if (!isOpen || !appointment) return null;

  const isPackage = appointment.category?.toUpperCase().includes('PACOTE');
  const hasPendingSessions = isPackage && packageInfo && packageInfo.current < packageInfo.total;
  const isLastSession = isPackage && packageInfo && packageInfo.current >= packageInfo.total;
  
  const paymentStatus = packageInfo?.paymentStatus || 'NONE';
  const isPaymentMissing = paymentStatus === 'NONE';

  // Rule: Block finish IF it's the last session AND payment is still "NONE"
  const isFinishBlocked = isLastSession && isPaymentMissing;

  // New Rule: Show payment button in ANY session if payment is missing for a package
  const showPaymentButton = isPackage && isPaymentMissing;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden relative border border-emerald-100">
        
        {/* Header / Status Banner */}
        <div className="bg-emerald-500 p-8 text-center relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/diagonal-stripes.png')] opacity-10 animate-slide"></div>
           
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-emerald-400/20 rounded-full animate-ping opacity-75 duration-1000"></div>
           <div className="relative z-10 flex flex-col items-center">
               <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider mb-2 animate-bounce">
                  <Clock size={16} /> Em Atendimento
               </div>
               <h2 className="text-white font-black text-4xl tracking-tight drop-shadow-sm">{appointment.time}</h2>
           </div>
        </div>

        <div className="p-8 flex flex-col items-center text-center -mt-10 relative z-20">
           
           <div className="relative mb-6">
               <div className="relative w-28 h-28 rounded-full border-[6px] border-white shadow-2xl overflow-hidden bg-gray-100">
                  <img src={appointment.avatar} alt={appointment.client} className="w-full h-full object-cover animate-[pulse_3s_ease-in-out_infinite]" />
               </div>
               <div className="absolute bottom-1 right-1 w-6 h-6 bg-emerald-500 border-4 border-white rounded-full"></div>
           </div>

           <h3 className="text-2xl font-bold text-gray-800 mb-2">{appointment.clientNickname || appointment.client}</h3>
           
           <div className="flex flex-col items-center gap-2 mb-6">
               <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider shadow-sm ${
                  isPackage 
                  ? 'bg-purple-100 text-purple-700 border border-purple-200' 
                  : 'bg-blue-50 text-blue-600 border border-blue-100'
               }`}>
                   {isPackage ? <Layers size={14} strokeWidth={3} /> : <Scissors size={14} strokeWidth={3} />}
                   {isPackage ? 'Pacote Promocional' : 'Serviço Avulso'}
               </div>
               {isPackage && packageInfo && (
                   <span className="text-sm font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full border border-gray-200">
                       Sessão {packageInfo.current} de {packageInfo.total}
                   </span>
               )}
           </div>

           <div className="w-full bg-gray-50 p-4 rounded-2xl border border-gray-100 mb-6">
              <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Procedimento</span>
              <span className="block font-bold text-gray-700 text-lg leading-tight">{appointment.service}</span>
           </div>

           {/* PAYMENT STATUS / WARNINGS */}
           {isPackage && (
               <div className="w-full mb-6 space-y-3">
                   {isFinishBlocked && (
                       <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 text-left animate-in shake duration-500">
                           <AlertTriangle className="text-red-500 shrink-0 mt-0.5" size={18} />
                           <div>
                               <p className="text-xs font-black text-red-700 uppercase tracking-tight">PAGAMENTO PENDENTE</p>
                               <p className="text-[10px] text-red-600 font-medium leading-snug">Esta é a última sessão. O pagamento do pacote deve ser registrado para concluir o atendimento.</p>
                           </div>
                       </div>
                   )}
                   
                   {!isPaymentMissing && (
                       <div className={`p-3 rounded-xl flex items-center justify-center gap-2 ${
                           paymentStatus === 'PAID' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-orange-50 text-orange-700 border border-orange-100'
                       }`}>
                           {paymentStatus === 'PAID' ? <CheckCircle2 size={18} /> : <Clock size={18} />}
                           <span className="font-bold text-sm uppercase">
                               {paymentStatus === 'PAID' ? 'Pacote Pago' : 'Pagamento Pendente'}
                           </span>
                       </div>
                   )}
               </div>
           )}
            
           <div className="grid grid-cols-2 gap-4 w-full">
              
              {/* Payment Button: Shows whenever is missing for a package */}
              {showPaymentButton && (
                  <button 
                    onClick={() => onFinish('PAY_NOW')}
                    className={`col-span-2 py-4 rounded-2xl font-bold shadow-lg transition-all flex items-center justify-center gap-2 animate-in slide-in-from-bottom-2 ${
                        isFinishBlocked ? 'bg-blue-600 text-white shadow-blue-200 ring-4 ring-blue-50' : 'bg-blue-50 text-blue-600 border border-blue-100'
                    }`}
                  >
                     <CreditCard size={20} />
                     {isFinishBlocked ? 'Registrar Pagamento para Finalizar' : 'Registrar Pagamento do Pacote'}
                  </button>
              )}

              {/* Schedule Next Session (Intermediate sessions only) */}
              {hasPendingSessions && (
                  <button 
                    onClick={onScheduleNext}
                    className="col-span-2 py-4 rounded-2xl bg-purple-600 text-white font-bold shadow-lg shadow-purple-200 hover:bg-purple-700 transition-all flex items-center justify-center gap-2 animate-in slide-in-from-bottom-2"
                  >
                     <CalendarPlus size={20} />
                     Agendar Próxima Sessão
                  </button>
              )}

              {/* Renew Package (Enabled only if paid and it's last session) */}
              {isLastSession && onRenew && !isFinishBlocked && (
                  <button 
                    onClick={onRenew}
                    className="col-span-2 py-4 rounded-2xl bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-200 hover:bg-emerald-600 transition-all flex items-center justify-center gap-2 animate-in slide-in-from-bottom-2"
                  >
                     <RotateCw size={20} />
                     Renovar Pacote
                  </button>
              )}

              {/* FINALIZADO Button - Always col-span-2, blocked if mandatory payment missing */}
              {!hasPendingSessions && (
                <button 
                    onClick={() => !isFinishBlocked && onFinish()}
                    disabled={isFinishBlocked}
                    className={`col-span-2 py-4 rounded-2xl font-bold transition-all transform flex flex-col items-center justify-center gap-1 active:scale-95 shadow-lg ${
                        isFinishBlocked 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-60 shadow-none' 
                        : 'bg-emerald-500 text-white shadow-emerald-200 hover:bg-emerald-600'
                    }`}
                >
                    <CheckCircle2 size={24} />
                    <span className="text-xs uppercase tracking-wider">
                        {isFinishBlocked ? 'PAGAMENTO OBRIGATÓRIO' : 'FINALIZAR ATENDIMENTO'}
                    </span>
                </button>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};
