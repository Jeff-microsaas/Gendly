import React, { useState, useMemo, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Plus, Layers, Scissors, CheckCircle2, AlertCircle, CalendarPlus } from 'lucide-react';
import { Appointment } from '../types';

interface CalendarViewProps {
  appointments: Appointment[];
  onSlotClick: (date: string, time: string) => void;
  onAppointmentClick: (appointment: Appointment) => void;
  onNewAppointment: () => void;
  openingTime: string;
  closingTime: string;
  interval: number;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ 
  appointments, 
  onSlotClick, 
  onAppointmentClick,
  onNewAppointment,
  openingTime = '08:00',
  closingTime = '19:00',
  interval = 30
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Format Date for comparison: YYYY-MM-DD
  const formattedDate = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, [currentDate]);

  // Display Date: "18 de Novembro"
  const displayDate = useMemo(() => {
      return currentDate.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' });
  }, [currentDate]);

  // Weekday: "Quarta-feira"
  const displayWeekday = useMemo(() => {
      const d = currentDate.toLocaleDateString('pt-BR', { weekday: 'long' });
      // Remove '-feira' for a cleaner look if desired, or keep it. Let's keep it full but UPPERCASE.
      return d; 
  }, [currentDate]);

  // Generate Slots
  const slots = useMemo(() => {
      const result = [];
      const [startH, startM] = openingTime.split(':').map(Number);
      const [endH, endM] = closingTime.split(':').map(Number);
      
      let current = new Date();
      current.setHours(startH, startM, 0, 0);
      
      const end = new Date();
      end.setHours(endH, endM, 0, 0);

      while (current <= end) {
          const h = String(current.getHours()).padStart(2, '0');
          const m = String(current.getMinutes()).padStart(2, '0');
          result.push(`${h}:${m}`);
          current.setMinutes(current.getMinutes() + interval);
      }
      return result;
  }, [openingTime, closingTime, interval]);

  // Filter Appointments for the day
  const dailyAppointments = useMemo(() => {
      return appointments.filter(apt => apt.rawDate === formattedDate && apt.status !== 'Cancelado');
  }, [appointments, formattedDate]);

  // Navigation Handlers
  const handlePrevDay = () => {
      const prev = new Date(currentDate);
      prev.setDate(prev.getDate() - 1);
      setCurrentDate(prev);
  };

  const handleNextDay = () => {
      const next = new Date(currentDate);
      next.setDate(next.getDate() + 1);
      setCurrentDate(next);
  };
  
  const handleToday = () => {
      setCurrentDate(new Date());
  };

  const isToday = useMemo(() => {
      const now = new Date();
      return formattedDate === `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }, [formattedDate]);

  // Current Time Indicator Position
  const [currentTimePosition, setCurrentTimePosition] = useState<number | null>(null);

  useEffect(() => {
      if (!isToday) {
          setCurrentTimePosition(null);
          return;
      }

      const calculatePosition = () => {
          const now = new Date();
          const [startH, startM] = openingTime.split(':').map(Number);
          const [endH, endM] = closingTime.split(':').map(Number);
          
          const startMinutes = startH * 60 + startM;
          const endMinutes = endH * 60 + endM;
          const currentMinutes = now.getHours() * 60 + now.getMinutes();

          if (currentMinutes < startMinutes || currentMinutes > endMinutes) {
              setCurrentTimePosition(null);
              return;
          }

          const totalDuration = endMinutes - startMinutes;
          const progress = (currentMinutes - startMinutes) / totalDuration;
          setCurrentTimePosition(progress * 100);
      };

      calculatePosition();
      const intervalId = setInterval(calculatePosition, 60000); // Update every minute
      return () => clearInterval(intervalId);
  }, [isToday, openingTime, closingTime]);


  return (
    <div className="flex flex-col h-full bg-white md:rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="flex flex-col xl:flex-row items-center justify-between p-6 border-b border-gray-100 bg-white z-10 gap-4">
            
            {/* Left Side: Date Info */}
            <div className="flex items-center gap-4 w-full xl:w-auto justify-center xl:justify-start">
                <div className="bg-purple-50 p-3 rounded-xl text-purple-600 hidden md:block">
                    <CalendarIcon size={24} />
                </div>
                <div className="text-center md:text-left">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-800 leading-tight capitalize">{displayDate}</h2>
                    <p className="text-sm font-medium text-gray-400">{currentDate.getFullYear()}</p>
                </div>
            </div>

            {/* Center: Navigation */}
            <div className="flex items-center justify-between bg-white rounded-2xl p-2 border border-gray-100 shadow-sm w-full md:w-auto order-3 xl:order-2">
                <button onClick={handlePrevDay} className="p-3 hover:bg-gray-50 rounded-xl text-gray-400 hover:text-purple-600 transition-all active:scale-95">
                    <ChevronLeft size={28} />
                </button>
                
                <div className="px-6 py-2 min-w-[200px] text-center" onClick={handleToday} title="Clique para voltar para Hoje">
                    <span className="text-lg md:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 uppercase tracking-widest cursor-pointer hover:opacity-80 transition-opacity">
                        {displayWeekday}
                    </span>
                </div>

                <button onClick={handleNextDay} className="p-3 hover:bg-gray-50 rounded-xl text-gray-400 hover:text-purple-600 transition-all active:scale-95">
                    <ChevronRight size={28} />
                </button>
            </div>

            {/* Right: New Appointment Button */}
            <div className="w-full xl:w-auto order-2 xl:order-3">
                 <button 
                    onClick={onNewAppointment}
                    className="w-full md:w-auto bg-purple-600 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-purple-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-200"
                >
                    <CalendarPlus size={20} />
                    <span>Novo Agendamento</span>
                </button>
            </div>
        </div>

        {/* Timeline Body */}
        <div className="flex-1 overflow-y-auto relative custom-scrollbar bg-gray-50/30">
            <div className="relative min-h-full pb-20 p-4 md:p-6 max-w-5xl mx-auto">
                
                {/* Time Indicator Line */}
                {currentTimePosition !== null && (
                    <div 
                        className="absolute left-16 right-6 border-t-2 border-red-400 z-10 flex items-center pointer-events-none"
                        style={{ top: `calc(${currentTimePosition}% + 2rem)` }} // approximate adjust
                    >
                        <div className="w-2 h-2 rounded-full bg-red-500 -ml-1"></div>
                        <div className="absolute right-0 -mt-6 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                            AGORA
                        </div>
                    </div>
                )}

                <div className="space-y-4">
                    {slots.map((slot) => {
                        const appointment = dailyAppointments.find(apt => apt.time === slot);
                        const isPackage = appointment?.category?.toUpperCase().includes('PACOTE');
                        const isConfirmed = appointment?.status === 'Confirmado';
                        const isInProgress = appointment?.status === 'Em Andamento';
                        const isPast = isToday && (() => {
                            const [h,m] = slot.split(':').map(Number);
                            const now = new Date();
                            return now.getHours() > h || (now.getHours() === h && now.getMinutes() > m);
                        })();

                        return (
                            <div key={slot} className="flex group">
                                {/* Time Label */}
                                <div className="w-16 shrink-0 flex flex-col items-center pt-2">
                                    <span className={`text-sm font-bold ${appointment ? 'text-gray-800' : 'text-gray-400'}`}>{slot}</span>
                                </div>

                                {/* Slot Content */}
                                <div className="flex-1 min-h-[5rem] relative">
                                    {appointment ? (
                                        <div 
                                            onClick={() => onAppointmentClick(appointment)}
                                            className={`
                                                relative w-full h-full rounded-2xl p-4 border transition-all cursor-pointer hover:scale-[1.01] hover:shadow-md flex flex-col md:flex-row md:items-center gap-4
                                                ${isInProgress 
                                                    ? 'bg-blue-50 border-blue-200 shadow-blue-100' 
                                                    : (isConfirmed ? 'bg-emerald-50 border-emerald-200 shadow-emerald-100' : 'bg-white border-gray-200 shadow-sm')
                                                }
                                            `}
                                        >   
                                            {/* Left Colored Strip */}
                                            <div className={`absolute top-2 bottom-2 left-0 w-1 rounded-r-full ${isInProgress ? 'bg-blue-500' : (isConfirmed ? 'bg-emerald-500' : 'bg-purple-400')}`}></div>

                                            <div className="pl-3 flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${isInProgress ? 'bg-blue-100 text-blue-700' : (isConfirmed ? 'bg-emerald-100 text-emerald-700' : 'bg-purple-100 text-purple-700')}`}>
                                                        {appointment.status}
                                                    </span>
                                                    {isPackage && (
                                                        <span className="text-[10px] font-bold text-gray-500 flex items-center gap-1">
                                                            <Layers size={10} /> Pacote
                                                        </span>
                                                    )}
                                                </div>
                                                <h3 className="font-bold text-gray-900 leading-tight">{appointment.service}</h3>
                                                <div className="flex items-center gap-2 mt-2">
                                                    {appointment.avatar ? (
                                                        <img src={appointment.avatar} className="w-5 h-5 rounded-full object-cover border border-white shadow-sm" alt="" />
                                                    ) : (
                                                        <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold">{appointment.client.charAt(0)}</div>
                                                    )}
                                                    <span className="text-xs font-medium text-gray-600">{appointment.clientNickname || appointment.client}</span>
                                                </div>
                                            </div>

                                            <div className="pl-3 md:pl-0 md:text-right md:pr-4">
                                                <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">Profissional</div>
                                                <div className="text-sm font-bold text-gray-800">{appointment.professional}</div>
                                            </div>
                                        </div>
                                    ) : (
                                        <button 
                                            onClick={() => onSlotClick(formattedDate, slot)}
                                            className={`
                                                w-full h-full rounded-2xl border-2 border-dashed border-gray-100 flex items-center justify-center gap-2 transition-all group-hover:border-purple-200 
                                                ${isPast ? 'bg-gray-50/50 cursor-not-allowed opacity-60' : 'bg-white/50 hover:bg-purple-50 cursor-pointer'}
                                            `}
                                            disabled={isPast}
                                        >
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${isPast ? 'bg-gray-100 text-gray-300' : 'bg-purple-100 text-purple-500 opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100'}`}>
                                                <Plus size={18} strokeWidth={3} />
                                            </div>
                                            <span className={`text-sm font-bold ${isPast ? 'text-gray-300' : 'text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity'}`}>
                                                {isPast ? 'Horário Passado' : 'Agendar Horário'}
                                            </span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    </div>
  );
};