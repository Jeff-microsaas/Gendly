import React, { useState, useMemo, useEffect } from 'react';
import { 
  ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Plus, Layers, 
  Scissors, CheckCircle2, AlertCircle, CalendarPlus, Sparkles, User, Check,
  Search, Lock, ArrowRight, Phone, CheckCircle, Tag, Share2, Copy, 
  ExternalLink, QrCode, MessageCircle, X, Globe
} from 'lucide-react';
import { Appointment, Product, Professional, Client } from '../types';
import { isWorkingDay, getNonWorkingReason, generateTimeSlots } from '../services/scheduleUtils';

interface CalendarViewProps {
  appointments: Appointment[];
  services?: Product[];
  professionals?: Professional[];
  clients?: Client[];
  companyName?: string;
  companyId?: string;
  onSlotClick: (date: string, time: string) => void;
  onAppointmentClick: (appointment: Appointment) => void;
  onNewAppointment: () => void;
  onSaveSmartAppointment?: (data: {
    date: string;
    time: string;
    service: string;
    professional: string;
    category: string;
    client: { name: string; nickname?: string; whatsapp?: string; avatar?: string };
  }) => void;
  onOpenPublicBooking?: () => void;
  openingTime: string;
  closingTime: string;
  interval: number;
  workOnSaturdays?: boolean;
  workOnSundays?: boolean;
  workOnHolidays?: boolean;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ 
  appointments, 
  services = [],
  professionals = [],
  clients = [],
  companyName = 'Studio de Beleza',
  companyId = 'studio-alana-moreira',
  onSlotClick, 
  onAppointmentClick,
  onNewAppointment,
  onSaveSmartAppointment,
  onOpenPublicBooking,
  openingTime = '08:00',
  closingTime = '19:00',
  interval = 30,
  workOnSaturdays = true,
  workOnSundays = false,
  workOnHolidays = false
}) => {
  // Mode: 'TIMELINE' (standard daily calendar) or 'SMART' (intelligent client booking)
  const [viewMode, setViewMode] = useState<'TIMELINE' | 'SMART'>('TIMELINE');
  const [currentDate, setCurrentDate] = useState(new Date());

  // Link Sharing state
  const [copiedLink, setCopiedLink] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  // Compute clean public booking URL
  const publicBookingUrl = useMemo(() => {
    if (typeof window === 'undefined') return '';
    const origin = window.location.origin;
    const path = window.location.pathname;
    return `${origin}${path}?agendar=${encodeURIComponent(companyId)}`;
  }, [companyId]);

  const handleCopyLink = () => {
    if (!publicBookingUrl) return;
    navigator.clipboard.writeText(publicBookingUrl).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    });
  };

  // --- SMART SCHEDULING STATE ---
  const todayStr = useMemo(() => new Date().toLocaleDateString('en-CA'), []);
  const [smartSelectedServiceId, setSmartSelectedServiceId] = useState<string>('');
  const [smartSelectedProfessional, setSmartSelectedProfessional] = useState<string>('ALL');
  const [smartSelectedDate, setSmartSelectedDate] = useState<string>(todayStr);
  const [smartSelectedTime, setSmartSelectedTime] = useState<string>('');
  const [smartClientMode, setSmartClientMode] = useState<'EXISTING' | 'NEW'>('EXISTING');
  const [smartSelectedClientId, setSmartSelectedClientId] = useState<string>('');
  const [smartClientName, setSmartClientName] = useState<string>('');
  const [smartClientPhone, setSmartClientPhone] = useState<string>('');
  const [smartServiceFilter, setSmartServiceFilter] = useState<'ALL' | 'SINGLE' | 'PACKAGE'>('ALL');
  const [smartSuccessMessage, setSmartSuccessMessage] = useState<string | null>(null);

  // Initialize service selection when services load
  useEffect(() => {
    if (services.length > 0 && !smartSelectedServiceId) {
      setSmartSelectedServiceId(services[0].id);
    }
  }, [services, smartSelectedServiceId]);

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
    return currentDate.toLocaleDateString('pt-BR', { weekday: 'long' });
  }, [currentDate]);

  // Check if current viewed date has expediente
  const currentDateNonWorkingReason = useMemo(() => {
    return getNonWorkingReason(currentDate, workOnSaturdays, workOnSundays, workOnHolidays);
  }, [currentDate, workOnSaturdays, workOnSundays, workOnHolidays]);

  // Generate Slots for the timeline
  const slots = useMemo(() => {
    return generateTimeSlots(openingTime, closingTime, interval);
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

  const handleJumpToNextWorkingDay = () => {
    const d = new Date(currentDate);
    for (let i = 1; i <= 30; i++) {
      d.setDate(d.getDate() + 1);
      if (isWorkingDay(d, workOnSaturdays, workOnSundays, workOnHolidays)) {
        setCurrentDate(new Date(d));
        return;
      }
    }
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
    const intervalId = setInterval(calculatePosition, 60000);
    return () => clearInterval(intervalId);
  }, [isToday, openingTime, closingTime]);

  // --- SMART SCHEDULING COMPUTED DATA ---
  
  // Filtered Services
  const smartFilteredServices = useMemo(() => {
    return services.filter(s => {
      if (smartServiceFilter === 'SINGLE') return s.subtype !== 'PACKAGE';
      if (smartServiceFilter === 'PACKAGE') return s.subtype === 'PACKAGE';
      return true;
    });
  }, [services, smartServiceFilter]);

  const selectedServiceObj = useMemo(() => {
    return services.find(s => s.id === smartSelectedServiceId) || services[0] || null;
  }, [services, smartSelectedServiceId]);

  // Generate 21 upcoming days, organized cleanly by working status
  const smartUpcomingDays = useMemo(() => {
    const days = [];
    const base = new Date();
    
    for (let i = 0; i < 21; i++) {
      const d = new Date(base);
      d.setDate(d.getDate() + i);
      const dateStr = d.toLocaleDateString('en-CA');
      const working = isWorkingDay(d, workOnSaturdays, workOnSundays, workOnHolidays);
      const reason = getNonWorkingReason(d, workOnSaturdays, workOnSundays, workOnHolidays);
      
      // Calculate occupied slots for this day
      const dayAppointments = appointments.filter(a => a.rawDate === dateStr && a.status !== 'Cancelado');
      let busyCount = 0;
      if (smartSelectedProfessional !== 'ALL') {
        busyCount = dayAppointments.filter(a => a.professional === smartSelectedProfessional).length;
      } else {
        // If ALL professionals, check unique time slots booked
        busyCount = new Set(dayAppointments.map(a => a.time)).size;
      }
      
      const totalSlotsCount = slots.length;
      const availableCount = Math.max(0, totalSlotsCount - busyCount);

      days.push({
        dateObj: d,
        dateStr,
        dayNumber: d.getDate(),
        weekdayShort: d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '').toUpperCase(),
        monthShort: d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', ''),
        isWorking: working,
        nonWorkingReason: reason,
        availableCount,
        isToday: dateStr === todayStr
      });
    }
    return days;
  }, [workOnSaturdays, workOnSundays, workOnHolidays, appointments, smartSelectedProfessional, slots.length, todayStr]);

  // Slots for the selected smart date
  const smartDateSlotStatus = useMemo(() => {
    if (!smartSelectedDate) return [];
    
    const dayObj = smartUpcomingDays.find(d => d.dateStr === smartSelectedDate);
    if (dayObj && !dayObj.isWorking) {
      return [];
    }

    const dayAppointments = appointments.filter(apt => apt.rawDate === smartSelectedDate && apt.status !== 'Cancelado');
    const now = new Date();
    const isCurrentDayToday = smartSelectedDate === todayStr;

    return slots.map(slot => {
      // Check if slot is occupied
      let isBooked = false;
      let bookedBy: string | undefined = undefined;
      let bookedProf: string | undefined = undefined;

      if (smartSelectedProfessional !== 'ALL') {
        const found = dayAppointments.find(a => a.time === slot && a.professional === smartSelectedProfessional);
        if (found) {
          isBooked = true;
          bookedBy = found.clientNickname || found.client;
          bookedProf = found.professional;
        }
      } else {
        // If "ALL" professionals, check if all professionals are occupied or any
        if (professionals.length > 0) {
          const matchingApts = dayAppointments.filter(a => a.time === slot);
          if (matchingApts.length >= professionals.length) {
            isBooked = true;
            bookedBy = 'Horário Preenchido';
          }
        } else {
          const found = dayAppointments.find(a => a.time === slot);
          if (found) {
            isBooked = true;
            bookedBy = found.clientNickname || found.client;
          }
        }
      }

      // Check if slot is in the past for today
      let isPast = false;
      if (isCurrentDayToday) {
        const [h, m] = slot.split(':').map(Number);
        if (now.getHours() > h || (now.getHours() === h && now.getMinutes() >= m)) {
          isPast = true;
        }
      }

      return {
        time: slot,
        isBooked,
        isPast,
        isAvailable: !isBooked && !isPast,
        bookedBy,
        bookedProf
      };
    });
  }, [smartSelectedDate, smartUpcomingDays, appointments, todayStr, slots, smartSelectedProfessional, professionals.length]);

  // Handle Smart Booking Submission
  const handleConfirmSmartBooking = () => {
    if (!smartSelectedServiceId || !smartSelectedDate || !smartSelectedTime) return;

    let targetClient: { name: string; nickname?: string; whatsapp?: string; avatar?: string };

    if (smartClientMode === 'EXISTING') {
      const foundClient = clients.find(c => c.id === smartSelectedClientId) || clients[0];
      if (!foundClient) {
        alert('Por favor, selecione um cliente ou cadastre um novo.');
        return;
      }
      targetClient = {
        name: foundClient.name,
        nickname: foundClient.nickname,
        whatsapp: foundClient.whatsapp,
        avatar: foundClient.avatar || undefined
      };
    } else {
      if (!smartClientName.trim()) {
        alert('Por favor, informe o nome do cliente.');
        return;
      }
      targetClient = {
        name: smartClientName.trim(),
        nickname: smartClientName.trim().split(' ')[0],
        whatsapp: smartClientPhone.trim(),
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(smartClientName.trim())}&background=random`
      };
    }

    // Determine professional
    let chosenProf = smartSelectedProfessional;
    if (chosenProf === 'ALL') {
      if (professionals.length > 0) {
        // Pick first available professional for this slot
        const dayApts = appointments.filter(a => a.rawDate === smartSelectedDate && a.time === smartSelectedTime && a.status !== 'Cancelado');
        const bookedProfNames = new Set(dayApts.map(a => a.professional));
        const freeProf = professionals.find(p => !bookedProfNames.has(p.nickname || p.name));
        chosenProf = freeProf ? (freeProf.nickname || freeProf.name) : (professionals[0].nickname || professionals[0].name);
      } else {
        chosenProf = 'Equipe';
      }
    }

    const serviceObj = services.find(s => s.id === smartSelectedServiceId);

    if (onSaveSmartAppointment) {
      onSaveSmartAppointment({
        date: smartSelectedDate,
        time: smartSelectedTime,
        service: serviceObj?.name || 'Procedimento',
        professional: chosenProf,
        category: serviceObj?.subtype === 'PACKAGE' ? 'Pacote' : 'Serviço Avulso',
        client: targetClient
      });
    }

    const bookedTime = smartSelectedTime;
    const bookedDate = smartSelectedDate;
    setSmartSelectedTime('');
    setSmartSuccessMessage(`Agendamento de ${serviceObj?.name} para ${targetClient.nickname || targetClient.name} às ${bookedTime} do dia ${bookedDate.split('-').reverse().join('/')} realizado com sucesso! Ele foi adicionado aos "Próximos Atendimentos" no Dashboard aguardando confirmação.`);

    setTimeout(() => {
      setSmartSuccessMessage(null);
    }, 6000);
  };

  return (
    <div className="flex flex-col h-full bg-white md:rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Top Header */}
      <div className="flex flex-col xl:flex-row items-center justify-between p-5 md:p-6 border-b border-gray-100 bg-white z-10 gap-4">
        
        {/* Left Side: View Mode & Date Info */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full xl:w-auto justify-center xl:justify-start">
          <div className="flex bg-gray-100 p-1 rounded-2xl shrink-0">
            <button 
              onClick={() => setViewMode('TIMELINE')} 
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${viewMode === 'TIMELINE' ? 'bg-white text-purple-700 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
            >
              <CalendarIcon size={16} />
              <span>Visão Diária</span>
            </button>
            <button 
              onClick={() => setViewMode('SMART')} 
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${viewMode === 'SMART' ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md shadow-purple-200' : 'text-gray-500 hover:text-gray-900'}`}
            >
              <Sparkles size={16} />
              <span>Agendamento Inteligente</span>
            </button>
          </div>

          {viewMode === 'TIMELINE' && (
            <div className="text-center sm:text-left">
              <h2 className="text-xl md:text-2xl font-bold text-gray-800 leading-tight capitalize">{displayDate}</h2>
              <p className="text-xs font-medium text-gray-400">{currentDate.getFullYear()}</p>
            </div>
          )}
        </div>

        {/* Center: Navigation (Only in Timeline view) */}
        {viewMode === 'TIMELINE' ? (
          <div className="flex items-center justify-between bg-white rounded-2xl p-2 border border-gray-100 shadow-sm w-full md:w-auto order-3 xl:order-2">
            <button onClick={handlePrevDay} className="p-2.5 hover:bg-gray-50 rounded-xl text-gray-400 hover:text-purple-600 transition-all active:scale-95" title="Dia anterior">
              <ChevronLeft size={24} />
            </button>
            
            <div className="px-5 py-1.5 min-w-[180px] text-center" onClick={handleToday} title="Clique para voltar para Hoje">
              <span className="text-base md:text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 uppercase tracking-widest cursor-pointer hover:opacity-80 transition-opacity">
                {displayWeekday}
              </span>
            </div>

            <button onClick={handleNextDay} className="p-2.5 hover:bg-gray-50 rounded-xl text-gray-400 hover:text-purple-600 transition-all active:scale-95" title="Próximo dia">
              <ChevronRight size={24} />
            </button>
          </div>
        ) : (
          <div className="hidden xl:flex items-center gap-2 text-xs font-medium text-purple-700 bg-purple-50 px-4 py-2 rounded-xl border border-purple-100">
            <Sparkles size={14} className="text-purple-500" />
            <span>Disponibilidade inteligente sincronizada em tempo real para clientes e equipe</span>
          </div>
        )}

        {/* Right: Action Button */}
        <div className="w-full xl:w-auto order-2 xl:order-3 flex items-center gap-2">
          {onOpenPublicBooking && (
            <button
              type="button"
              onClick={onOpenPublicBooking}
              className="bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-xs"
              title="Abrir página pública de agendamento online das clientes"
            >
              <Globe size={16} className="text-purple-600" />
              <span className="hidden sm:inline">Link dos Clientes</span>
              <span className="sm:hidden">Link</span>
            </button>
          )}

          {viewMode === 'TIMELINE' ? (
            <button 
              onClick={onNewAppointment}
              className="w-full md:w-auto bg-purple-600 text-white px-5 py-2.5 rounded-xl font-bold text-xs hover:bg-purple-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-200"
            >
              <CalendarPlus size={18} />
              <span>Novo Agendamento</span>
            </button>
          ) : (
            <button 
              onClick={() => setViewMode('TIMELINE')}
              className="w-full md:w-auto bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2"
            >
              <CalendarIcon size={16} />
              <span>Ver na Linha do Tempo</span>
            </button>
          )}
        </div>
      </div>

      {/* SUCCESS BANNER NOTIFICATION */}
      {smartSuccessMessage && (
        <div className="bg-emerald-50 border-b border-emerald-200 p-4 px-6 flex items-center justify-between text-emerald-800 animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-3">
            <CheckCircle className="text-emerald-600 shrink-0" size={22} />
            <span className="text-xs md:text-sm font-bold">{smartSuccessMessage}</span>
          </div>
          <button 
            onClick={() => setSmartSuccessMessage(null)}
            className="text-emerald-600 hover:text-emerald-900 text-xs font-bold px-2 py-1"
          >
            Fechar
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 1: TIMELINE VIEW (ORIGINAL LAYOUT FULLY PRESERVED)                  */}
      {/* ========================================================================= */}
      {viewMode === 'TIMELINE' && (
        <div className="flex-1 overflow-y-auto relative custom-scrollbar bg-gray-50/30">
          {/* Non-working Day Notice Banner if current date has no expediente */}
          {currentDateNonWorkingReason && (
            <div className="max-w-5xl mx-auto p-4 pb-0">
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-amber-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                    <Lock size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold">Sem Expediente Comercial Neste Dia</h4>
                    <p className="text-xs text-amber-700 mt-0.5">{currentDateNonWorkingReason}. Configurado em Ajustes &gt; Agenda &amp; Horários.</p>
                  </div>
                </div>
                <button 
                  onClick={handleJumpToNextWorkingDay}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 shadow-sm"
                >
                  <span>Ir para Próximo Dia Útil</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}

          <div className="relative min-h-full pb-20 p-4 md:p-6 max-w-5xl mx-auto">
            {/* Time Indicator Line */}
            {currentTimePosition !== null && (
              <div 
                className="absolute left-16 right-6 border-t-2 border-red-400 z-10 flex items-center pointer-events-none"
                style={{ top: `calc(${currentTimePosition}% + 2rem)` }}
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
                const isAwaiting = appointment?.status === 'Aguardando Confirmação';
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
                              : (isConfirmed 
                                  ? 'bg-emerald-50 border-emerald-200 shadow-emerald-100' 
                                  : (isAwaiting ? 'bg-amber-50 border-amber-200 shadow-amber-100' : 'bg-white border-gray-200 shadow-sm'))
                            }
                          `}
                        >   
                          {/* Left Colored Strip */}
                          <div className={`absolute top-2 bottom-2 left-0 w-1 rounded-r-full ${
                            isInProgress ? 'bg-blue-500' : (isConfirmed ? 'bg-emerald-500' : (isAwaiting ? 'bg-amber-500' : 'bg-purple-400'))
                          }`}></div>

                          <div className="pl-3 flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                                isInProgress 
                                  ? 'bg-blue-100 text-blue-700' 
                                  : (isConfirmed ? 'bg-emerald-100 text-emerald-700' : (isAwaiting ? 'bg-amber-100 text-amber-800 font-black' : 'bg-purple-100 text-purple-700'))
                              }`}>
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
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: SISTEMA DE AGENDAMENTO INTELIGENTE (DISPONIBILIDADE EM TEMPO REAL) */}
      {/* ========================================================================= */}
      {viewMode === 'SMART' && (
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8 bg-gray-50/40">
          <div className="max-w-6xl mx-auto space-y-8">
            
            {/* Intelligent Scheduler Hero Banner */}
            <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-pink-600 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="max-w-2xl">
                  <span className="bg-white/20 backdrop-blur-md text-white text-[11px] font-black uppercase tracking-widest px-3 py-1 rounded-full mb-3 inline-flex items-center gap-1.5">
                    <Sparkles size={12} /> Agenda Inteligente em Tempo Real
                  </span>
                  <h3 className="text-2xl md:text-3xl font-black leading-tight mt-2">
                    Escolha o Procedimento, Data e Horário Disponível
                  </h3>
                  <p className="text-white/80 text-xs md:text-sm mt-2 font-medium leading-relaxed">
                    As vagas são organizadas respeitando os dias úteis configurados. Cada horário preenchido é bloqueado imediatamente para todos os clientes, e o agendamento é enviado para o painel principal para confirmação.
                  </p>
                </div>

                {onOpenPublicBooking && (
                  <button
                    type="button"
                    onClick={onOpenPublicBooking}
                    className="shrink-0 px-6 py-4 bg-white hover:bg-purple-50 text-purple-700 rounded-2xl font-black text-xs uppercase tracking-wider shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                  >
                    <ExternalLink size={18} className="text-purple-600" />
                    <span>Visualizar como Cliente</span>
                  </button>
                )}
              </div>
            </div>

            {/* Public Link Share Widget */}
            <div className="bg-white rounded-3xl p-6 border border-purple-100 shadow-sm">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <span className="p-2.5 rounded-2xl bg-purple-100 text-purple-700">
                      <Globe size={20} />
                    </span>
                    <div>
                      <h4 className="text-base font-bold text-gray-900 leading-tight">
                        Link de Agendamento Online para Clientes
                      </h4>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Envie este link para qualquer pessoa agendar 24h por dia pelo WhatsApp, redes sociais ou site.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-600 font-mono w-full sm:w-auto max-w-sm truncate select-all">
                    {publicBookingUrl}
                  </div>

                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 active:scale-95"
                  >
                    {copiedLink ? <Check size={14} className="text-emerald-300" /> : <Copy size={14} />}
                    <span>{copiedLink ? 'Copiado!' : 'Copiar Link'}</span>
                  </button>

                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(
                      `Olá! ✨ Agende seu horário no *${companyName}* de forma rápida e prática no nosso sistema online:\n\n🔗 ${publicBookingUrl}\n\nEscolha o serviço, profissional, data e horário ideal para você!`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 active:scale-95"
                  >
                    <MessageCircle size={14} />
                    <span>WhatsApp</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => setIsQrModalOpen(true)}
                    className="px-3.5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                    title="Exibir QR Code para balcão ou espelhos"
                  >
                    <QrCode size={14} />
                    <span>QR Code</span>
                  </button>

                  {onOpenPublicBooking && (
                    <button
                      type="button"
                      onClick={onOpenPublicBooking}
                      className="px-3.5 py-2.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95"
                    >
                      <ExternalLink size={14} />
                      <span>Testar Página</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Main Interactive Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: Procedures & Professionals Selection (5 cols) */}
              <div className="lg:col-span-5 space-y-6">
                
                {/* 1. SELEÇÃO DE SERVIÇO */}
                <div className="bg-white rounded-3xl p-5 md:p-6 border border-gray-100 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-base font-bold text-gray-900 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-purple-600 text-white text-xs font-black flex items-center justify-center">1</span>
                        Procedimento / Serviço
                      </h4>
                      <p className="text-xs text-gray-400 mt-0.5">Selecione o serviço que deseja agendar</p>
                    </div>

                    {/* Filter Avulsos / Pacotes */}
                    <div className="flex bg-gray-100 p-1 rounded-xl text-[10px] font-bold">
                      <button 
                        onClick={() => setSmartServiceFilter('ALL')}
                        className={`px-2.5 py-1 rounded-lg transition-all ${smartServiceFilter === 'ALL' ? 'bg-white text-purple-700 shadow-xs' : 'text-gray-500'}`}
                      >
                        Todos
                      </button>
                      <button 
                        onClick={() => setSmartServiceFilter('SINGLE')}
                        className={`px-2.5 py-1 rounded-lg transition-all ${smartServiceFilter === 'SINGLE' ? 'bg-white text-purple-700 shadow-xs' : 'text-gray-500'}`}
                      >
                        Avulsos
                      </button>
                      <button 
                        onClick={() => setSmartServiceFilter('PACKAGE')}
                        className={`px-2.5 py-1 rounded-lg transition-all ${smartServiceFilter === 'PACKAGE' ? 'bg-white text-purple-700 shadow-xs' : 'text-gray-500'}`}
                      >
                        Pacotes
                      </button>
                    </div>
                  </div>

                  {/* Services List */}
                  <div className="space-y-2.5 max-h-72 overflow-y-auto custom-scrollbar pr-1">
                    {smartFilteredServices.length > 0 ? (
                      smartFilteredServices.map(service => {
                        const isSelected = smartSelectedServiceId === service.id;
                        const isPackage = service.subtype === 'PACKAGE';

                        return (
                          <div
                            key={service.id}
                            onClick={() => {
                              setSmartSelectedServiceId(service.id);
                              setSmartSelectedTime(''); // Reset selected time when changing service
                            }}
                            className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                              isSelected
                                ? 'border-purple-600 bg-purple-50/70 ring-2 ring-purple-400 shadow-xs'
                                : 'border-gray-100 hover:border-purple-200 hover:bg-gray-50/50'
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isSelected ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                                {isPackage ? <Layers size={18} /> : <Scissors size={18} />}
                              </div>
                              <div className="min-w-0">
                                <h5 className={`text-xs md:text-sm font-bold truncate ${isSelected ? 'text-purple-900' : 'text-gray-800'}`}>
                                  {service.name}
                                </h5>
                                <p className="text-[11px] text-gray-400 truncate mt-0.5">
                                  {isPackage ? `${service.sessionCount || 4} sessões inclusas` : (service.description || 'Atendimento profissional')}
                                </p>
                              </div>
                            </div>

                            <div className="text-right shrink-0 pl-3">
                              <span className="text-xs md:text-sm font-bold text-gray-900 block">
                                R$ {service.price.toFixed(2).replace('.', ',')}
                              </span>
                              {isSelected && (
                                <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full mt-1 inline-block">
                                  Selecionado
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-6 text-gray-400 text-xs italic">
                        Nenhum serviço cadastrado nesta categoria.
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. SELEÇÃO DE PROFISSIONAL */}
                <div className="bg-white rounded-3xl p-5 md:p-6 border border-gray-100 shadow-sm space-y-4">
                  <div>
                    <h4 className="text-base font-bold text-gray-900 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-purple-600 text-white text-xs font-black flex items-center justify-center">2</span>
                      Profissional
                    </h4>
                    <p className="text-xs text-gray-400 mt-0.5">Escolha o profissional ou deixe em aberto</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    {/* Option ALL */}
                    <button
                      type="button"
                      onClick={() => {
                        setSmartSelectedProfessional('ALL');
                        setSmartSelectedTime('');
                      }}
                      className={`p-3 rounded-2xl border text-left transition-all flex items-center gap-2.5 ${
                        smartSelectedProfessional === 'ALL'
                          ? 'bg-purple-100 text-purple-900 border-purple-300 ring-2 ring-purple-300 font-bold'
                          : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-full bg-purple-200 text-purple-700 flex items-center justify-center font-bold text-xs shrink-0">
                        <Sparkles size={14} />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold truncate">Sem preferência</div>
                        <div className="text-[10px] text-gray-400 truncate">Qualquer profissional</div>
                      </div>
                    </button>

                    {/* Dynamic Professionals List */}
                    {professionals.map(prof => {
                      const profDisplayName = prof.nickname || prof.name;
                      const isSelected = smartSelectedProfessional === profDisplayName;

                      return (
                        <button
                          key={prof.id}
                          type="button"
                          onClick={() => {
                            setSmartSelectedProfessional(profDisplayName);
                            setSmartSelectedTime('');
                          }}
                          className={`p-3 rounded-2xl border text-left transition-all flex items-center gap-2.5 ${
                            isSelected
                              ? 'bg-purple-100 text-purple-900 border-purple-300 ring-2 ring-purple-300 font-bold'
                              : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          {prof.avatar ? (
                            <img src={prof.avatar} alt={profDisplayName} className="w-8 h-8 rounded-full object-cover shrink-0 border border-white shadow-xs" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-lilac-100 text-purple-700 flex items-center justify-center font-bold text-xs shrink-0">
                              {profDisplayName.charAt(0)}
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="text-xs font-bold truncate">{profDisplayName}</div>
                            <div className="text-[10px] text-gray-400 truncate">{prof.name}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. IDENTIFICAÇÃO DO CLIENTE */}
                <div className="bg-white rounded-3xl p-5 md:p-6 border border-gray-100 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-base font-bold text-gray-900 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-purple-600 text-white text-xs font-black flex items-center justify-center">3</span>
                        Dados do Cliente
                      </h4>
                      <p className="text-xs text-gray-400 mt-0.5">Identifique quem receberá o atendimento</p>
                    </div>

                    <div className="flex bg-gray-100 p-1 rounded-xl text-[10px] font-bold">
                      <button 
                        onClick={() => setSmartClientMode('EXISTING')}
                        className={`px-2.5 py-1 rounded-lg transition-all ${smartClientMode === 'EXISTING' ? 'bg-white text-purple-700 shadow-xs' : 'text-gray-500'}`}
                      >
                        Cadastrado
                      </button>
                      <button 
                        onClick={() => setSmartClientMode('NEW')}
                        className={`px-2.5 py-1 rounded-lg transition-all ${smartClientMode === 'NEW' ? 'bg-white text-purple-700 shadow-xs' : 'text-gray-500'}`}
                      >
                        Novo Cliente
                      </button>
                    </div>
                  </div>

                  {smartClientMode === 'EXISTING' ? (
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Selecione o Cliente</label>
                      <select 
                        value={smartSelectedClientId} 
                        onChange={(e) => setSmartSelectedClientId(e.target.value)}
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs md:text-sm font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-300"
                      >
                        <option value="">Selecione um cliente na lista...</option>
                        {clients.map(c => (
                          <option key={c.id} value={c.id}>
                            {c.name} {c.nickname ? `(${c.nickname})` : ''} - {c.whatsapp || 'Sem Whats'}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Nome Completo</label>
                        <div className="relative">
                          <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input 
                            type="text" 
                            placeholder="Ex: Mariana Silva" 
                            value={smartClientName}
                            onChange={(e) => setSmartClientName(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs md:text-sm font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-300"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">WhatsApp / Celular</label>
                        <div className="relative">
                          <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input 
                            type="tel" 
                            placeholder="(00) 00000-0000" 
                            value={smartClientPhone}
                            onChange={(e) => setSmartClientPhone(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs md:text-sm font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-300"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Date Strip, Real-time Slot Matrix & Booking Confirmation (7 cols) */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* 4. SELEÇÃO DE DATA COM CALENDÁRIO INTELIGENTE */}
                <div className="bg-white rounded-3xl p-5 md:p-6 border border-gray-100 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-base font-bold text-gray-900 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-purple-600 text-white text-xs font-black flex items-center justify-center">4</span>
                        Datas Disponíveis na Agenda
                      </h4>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Organizado nos dias úteis com expediente ({(!workOnSaturdays || !workOnSundays || !workOnHolidays) ? 'dias sem expediente desabilitados' : 'todos os dias ativos'})
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-[11px] font-bold text-purple-600 bg-purple-50 px-2.5 py-1 rounded-full">
                        Próximas 3 semanas
                      </span>
                    </div>
                  </div>

                  {/* Horizontal Dates Strip */}
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-2 max-h-72 overflow-y-auto custom-scrollbar p-1">
                    {smartUpcomingDays.map(day => {
                      const isSelected = smartSelectedDate === day.dateStr;
                      const isWorking = day.isWorking;

                      return (
                        <button
                          key={day.dateStr}
                          type="button"
                          onClick={() => {
                            if (isWorking) {
                              setSmartSelectedDate(day.dateStr);
                              setSmartSelectedTime('');
                            }
                          }}
                          disabled={!isWorking}
                          className={`p-2.5 rounded-2xl border text-center transition-all flex flex-col items-center justify-between min-h-[92px] ${
                            !isWorking 
                              ? 'bg-gray-50/70 border-gray-100 opacity-40 cursor-not-allowed text-gray-400'
                              : (isSelected 
                                  ? 'bg-gradient-to-b from-purple-600 to-indigo-600 text-white border-purple-600 shadow-md shadow-purple-200 ring-2 ring-purple-300'
                                  : 'bg-white hover:bg-purple-50/50 border-gray-200 text-gray-800 hover:border-purple-200'
                                )
                          }`}
                        >
                          <span className={`text-[10px] font-black uppercase tracking-wider ${isSelected ? 'text-white/80' : 'text-gray-400'}`}>
                            {day.weekdayShort}
                          </span>
                          
                          <div className="my-1">
                            <span className="text-lg md:text-xl font-black block leading-none">
                              {day.dayNumber}
                            </span>
                            <span className={`text-[9px] font-medium uppercase ${isSelected ? 'text-white/80' : 'text-gray-400'}`}>
                              {day.monthShort}
                            </span>
                          </div>

                          {/* Availability badge */}
                          {isWorking ? (
                            <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md leading-tight ${
                              isSelected 
                                ? 'bg-white/20 text-white' 
                                : (day.availableCount > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600')
                            }`}>
                              {day.availableCount > 0 ? `${day.availableCount} livres` : 'Lotado'}
                            </span>
                          ) : (
                            <span className="text-[8px] font-bold text-gray-400 flex items-center gap-0.5">
                              <Lock size={8} /> Fechado
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 5. HORÁRIOS DISPONÍVEIS EM TEMPO REAL */}
                <div className="bg-white rounded-3xl p-5 md:p-6 border border-gray-100 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="text-base font-bold text-gray-900 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-purple-600 text-white text-xs font-black flex items-center justify-center">5</span>
                        Horários em Tempo Real
                      </h4>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Data selecionada: <span className="font-bold text-purple-700">{smartSelectedDate.split('-').reverse().join('/')}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] font-bold">
                      <div className="flex items-center gap-1.5 text-emerald-600">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                        Disponível
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-400">
                        <span className="w-2.5 h-2.5 rounded-full bg-gray-300"></span>
                        Ocupado
                      </div>
                    </div>
                  </div>

                  {/* Slots Grid */}
                  {smartDateSlotStatus.length > 0 ? (
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5 max-h-64 overflow-y-auto custom-scrollbar p-1">
                      {smartDateSlotStatus.map(slotItem => {
                        const isSelected = smartSelectedTime === slotItem.time;

                        if (slotItem.isBooked) {
                          return (
                            <div 
                              key={slotItem.time}
                              className="p-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-400 flex flex-col items-center justify-center opacity-60 cursor-not-allowed select-none"
                              title={`Horário ocupado (${slotItem.bookedBy || 'Já reservado'})`}
                            >
                              <span className="text-xs font-bold line-through">{slotItem.time}</span>
                              <span className="text-[9px] font-bold text-gray-400 mt-0.5 flex items-center gap-1">
                                <Lock size={10} /> Ocupado
                              </span>
                            </div>
                          );
                        }

                        if (slotItem.isPast) {
                          return (
                            <div 
                              key={slotItem.time}
                              className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 text-gray-300 flex flex-col items-center justify-center opacity-40 cursor-not-allowed"
                            >
                              <span className="text-xs font-bold">{slotItem.time}</span>
                              <span className="text-[9px] mt-0.5">Passado</span>
                            </div>
                          );
                        }

                        return (
                          <button
                            key={slotItem.time}
                            type="button"
                            onClick={() => setSmartSelectedTime(slotItem.time)}
                            className={`p-2.5 rounded-xl border font-bold text-xs transition-all flex flex-col items-center justify-center ${
                              isSelected
                                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-transparent shadow-md shadow-purple-200 ring-2 ring-purple-300 scale-[1.02]'
                                : 'bg-white hover:bg-purple-50 text-gray-800 border-gray-200 hover:border-purple-300'
                            }`}
                          >
                            <span className="text-sm font-black">{slotItem.time}</span>
                            <span className={`text-[9px] mt-0.5 ${isSelected ? 'text-white/90' : 'text-emerald-600 font-bold'}`}>
                              {isSelected ? 'Escolhido' : 'Livre'}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="bg-amber-50 rounded-2xl p-6 text-center border border-amber-200 text-amber-800">
                      <AlertCircle className="mx-auto mb-2 text-amber-500" size={24} />
                      <h5 className="font-bold text-sm">Sem expediente nesta data</h5>
                      <p className="text-xs text-amber-600 mt-1">
                        Esta data foi configurada sem expediente em Ajustes &gt; Agenda &amp; Horários. Por favor, selecione outro dia útil acima.
                      </p>
                    </div>
                  )}
                </div>

                {/* 6. RESUMO & CONFIRMAÇÃO DO AGENDAMENTO */}
                <div className="bg-gradient-to-br from-purple-900 to-indigo-900 text-white rounded-3xl p-6 shadow-xl space-y-4">
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-purple-300">Resumo da Reserva</span>
                      <h4 className="text-lg font-bold mt-0.5">Confirmar Agendamento Inteligente</h4>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-white/60 block">Valor</span>
                      <span className="text-xl font-black text-white">
                        R$ {(selectedServiceObj?.price || 0).toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                    <div className="bg-white/10 rounded-xl p-3">
                      <span className="text-[10px] text-white/60 block uppercase">Serviço</span>
                      <span className="font-bold text-white truncate block mt-0.5">{selectedServiceObj?.name || 'Não selecionado'}</span>
                    </div>
                    <div className="bg-white/10 rounded-xl p-3">
                      <span className="text-[10px] text-white/60 block uppercase">Profissional</span>
                      <span className="font-bold text-white truncate block mt-0.5">{smartSelectedProfessional === 'ALL' ? 'Qualquer disponível' : smartSelectedProfessional}</span>
                    </div>
                    <div className="bg-white/10 rounded-xl p-3">
                      <span className="text-[10px] text-white/60 block uppercase">Data</span>
                      <span className="font-bold text-white truncate block mt-0.5">{smartSelectedDate.split('-').reverse().join('/')}</span>
                    </div>
                    <div className="bg-white/10 rounded-xl p-3">
                      <span className="text-[10px] text-white/60 block uppercase">Horário</span>
                      <span className="font-bold text-purple-300 truncate block mt-0.5 text-sm">{smartSelectedTime || 'Pendente'}</span>
                    </div>
                  </div>

                  <div className="text-[11px] text-white/70 bg-white/5 rounded-xl p-3 border border-white/10">
                    ℹ️ <strong className="text-white">Status Inicial:</strong> Este agendamento será registrado imediatamente e enviado para a lista de <strong>Próximos Atendimentos</strong> no Dashboard principal com status <em>"Aguardando Confirmação"</em>.
                  </div>

                  <button
                    type="button"
                    onClick={handleConfirmSmartBooking}
                    disabled={!smartSelectedServiceId || !smartSelectedDate || !smartSelectedTime || (smartClientMode === 'EXISTING' && !smartSelectedClientId && clients.length > 0) || (smartClientMode === 'NEW' && !smartClientName.trim())}
                    className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-2xl font-black text-sm uppercase tracking-wider shadow-lg shadow-emerald-900/40 hover:scale-[1.01] active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 size={18} />
                    <span>Confirmar e Reservar Agendamento</span>
                  </button>
                </div>

              </div>

            </div>
          </div>
        </div>
      )}
      {/* QR Code Modal for Counter/Mirror Display */}
      {isQrModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-sm w-full text-center shadow-2xl border border-gray-100 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-gray-900">QR Code da Agenda Online</h3>
              <button 
                onClick={() => setIsQrModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>
            
            <p className="text-xs text-gray-500">
              Imprima ou deixe visível na recepção para que suas clientes apontem a câmera do celular e agendem instantaneamente.
            </p>

            <div className="p-4 bg-purple-50/50 rounded-2xl border border-purple-100 inline-block mx-auto">
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(publicBookingUrl)}`}
                alt="QR Code da Agenda" 
                className="w-48 h-48 mx-auto rounded-xl shadow-xs"
              />
            </div>

            <div className="space-y-2">
              <button
                onClick={handleCopyLink}
                className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
              >
                {copiedLink ? <Check size={14} /> : <Copy size={14} />}
                <span>{copiedLink ? 'Link Copiado!' : 'Copiar Link'}</span>
              </button>

              <button
                onClick={() => setIsQrModalOpen(false)}
                className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl text-xs font-semibold transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
