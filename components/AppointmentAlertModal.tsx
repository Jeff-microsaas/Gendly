import React, { useState } from 'react';
import { X, Clock, User, Scissors, Layers, BellRing, Play, Timer } from 'lucide-react';
import { Appointment } from '../types';

interface AppointmentAlertModalProps {
  appointment: Appointment | null;
  onClose: () => void; // Standard close (dismiss)
  onStart: () => void; // Logic to start appointment
  onSnooze: (minutes: number) => void; // Logic to snooze
  packageInfo?: { current: number, total: number } | null; // New prop for session info
}

export const AppointmentAlertModal: React.FC<AppointmentAlertModalProps> = ({ appointment, onClose, onStart, onSnooze, packageInfo }) => {
  const [isSnoozing, setIsSnoozing] = useState(false);

  if (!appointment) return null;

  const isPackage = appointment.category?.toUpperCase().includes('PACOTE');

  const handleSnoozeClick = (min: number) => {
      onSnooze(min);
      setIsSnoozing(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end md:items-start justify-center md:justify-end p-4 md:p-6 pointer-events-none">
      <div className="bg-white rounded-3xl shadow-2xl border border-purple-100 w-full max-w-sm pointer-events-auto animate-in slide-in-from-right-8 fade-in duration-500 relative overflow-hidden ring-4 ring-purple-50">
        
        {/* Animated Background Pulse */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl -mr-10 -mt-10 animate-pulse"></div>

        {/* Header */}
        <div className="p-5 border-b border-gray-50 flex items-start justify-between bg-white relative z-10">
           <div className="flex items-center gap-3">
              <div className="bg-purple-100 p-2.5 rounded-xl text-purple-600 animate-bounce">
                 <BellRing size={20} />
              </div>
              <div>
                 <h3 className="font-bold text-gray-800 text-lg leading-tight">Atendimento Próximo</h3>
                 <p className="text-xs text-purple-600 font-bold uppercase tracking-wider">Confirmado</p>
              </div>
           </div>
           <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-1">
             <X size={20} />
           </button>
        </div>

        {/* Body Content */}
        {!isSnoozing ? (
            <div className="p-5 space-y-5 relative z-10">
                {/* Time Highlight */}
                <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <div className="text-center min-w-[3.5rem] border-r border-gray-200 pr-4">
                        <div className="text-2xl font-black text-gray-800 leading-none">{appointment.time}</div>
                        <div className="text-[10px] text-gray-400 font-bold uppercase mt-1">Horário</div>
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-1">
                            <Clock size={14} className="text-purple-500" />
                            <span>Prepare-se para iniciar</span>
                        </div>
                        <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full bg-purple-500 w-2/3 animate-[shimmer_2s_infinite]"></div>
                        </div>
                    </div>
                </div>

                {/* Client & Service Info */}
                <div className="flex gap-4">
                    <div className="relative shrink-0">
                        <img src={appointment.avatar} alt={appointment.client} className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-md" />
                        <div className="absolute -bottom-1 -right-1 bg-emerald-500 w-4 h-4 border-2 border-white rounded-full"></div>
                    </div>
                    <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-gray-900 truncate text-lg">{appointment.client}</h4>
                        <div className="flex flex-wrap items-center gap-1.5 text-xs text-gray-500 mt-1 mb-2">
                             <div className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${
                                isPackage ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                             }`}>
                                {isPackage ? <Layers size={10} /> : <Scissors size={10} />}
                                {isPackage ? 'Pacote' : 'Serviço Avulso'}
                             </div>
                             
                             {/* Session Highlight for Alert */}
                             {isPackage && packageInfo && (
                                <span className="bg-gray-800 text-white px-2 py-0.5 rounded text-[10px] font-bold">
                                   Sessão {packageInfo.current}/{packageInfo.total}
                                </span>
                             )}
                        </div>
                        <p className="text-sm text-gray-700 font-medium truncate">{appointment.service}</p>
                        
                        {isPackage && packageInfo && (
                           <p className="text-[10px] font-bold text-purple-500 uppercase tracking-wide mt-1">
                              Faltam {packageInfo.total - packageInfo.current} sessões para concluir
                           </p>
                        )}
                    </div>
                </div>
            </div>
        ) : (
            <div className="p-5 relative z-10">
                <h4 className="font-bold text-gray-800 mb-4 text-center">Adiar por quanto tempo?</h4>
                <div className="grid grid-cols-3 gap-3">
                    {[5, 10, 15].map(min => (
                        <button 
                            key={min}
                            onClick={() => handleSnoozeClick(min)}
                            className="flex flex-col items-center justify-center p-3 rounded-xl border border-gray-200 hover:border-purple-400 hover:bg-purple-50 transition-all"
                        >
                            <span className="text-xl font-black text-gray-700 mb-1">{min}</span>
                            <span className="text-xs font-bold text-gray-400 uppercase">Minutos</span>
                        </button>
                    ))}
                </div>
                <button 
                    onClick={() => setIsSnoozing(false)}
                    className="w-full mt-4 py-3 text-gray-500 font-bold text-sm hover:text-gray-700"
                >
                    Cancelar
                </button>
            </div>
        )}

        {/* Footer Action */}
        {!isSnoozing && (
            <div className="p-4 bg-gray-50 border-t border-gray-100 relative z-10 grid grid-cols-2 gap-3">
                <button 
                    onClick={() => setIsSnoozing(true)}
                    className="py-3 bg-white border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-100 transition-all flex items-center justify-center gap-2"
                >
                    <Timer size={18} />
                    Adiar Alerta
                </button>
                <button 
                    onClick={onStart}
                    className="py-3 bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-200 hover:bg-emerald-600 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                >
                    <Play size={18} fill="currentColor" />
                    Iniciar Atendimento
                </button>
            </div>
        )}
      </div>
    </div>
  );
};