import React, { useState, useMemo } from 'react';
import { 
  Scissors, Calendar, Clock, User, Phone, CheckCircle2, 
  ChevronRight, ChevronLeft, Sparkles, MapPin, Share2, 
  Copy, Check, AlertCircle, ArrowLeft, Send, MessageCircle,
  ExternalLink, CalendarPlus, X, Info
} from 'lucide-react';
import { Company, Product, Professional, Appointment } from '../types';
import { isWorkingDay, getNonWorkingReason, generateTimeSlots } from '../services/scheduleUtils';

interface PublicBookingPageProps {
  company: Company;
  services: Product[];
  professionals: Professional[];
  appointments: Appointment[];
  settings: {
    openingTime?: string;
    closingTime?: string;
    interval?: number;
    workOnSaturdays?: boolean;
    workOnSundays?: boolean;
    workOnHolidays?: boolean;
    pixKey?: string;
  };
  onSaveAppointment: (data: {
    date: string;
    time: string;
    service: string;
    professional: string;
    category: string;
    client: { name: string; whatsapp: string; notes?: string };
  }) => void;
  onExitPreview?: () => void;
}

export const PublicBookingPage: React.FC<PublicBookingPageProps> = ({
  company,
  services,
  professionals,
  appointments,
  settings,
  onSaveAppointment,
  onExitPreview
}) => {
  // Step state: 1: Service, 2: Professional, 3: Date & Time, 4: Client Info, 5: Confirmation Success
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Form selections
  const [selectedService, setSelectedService] = useState<Product | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchService, setSearchService] = useState<string>('');
  
  // Professional: null or 'ANY' or Professional
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | 'ANY'>('ANY');
  
  // Date & Time
  const todayStr = useMemo(() => new Date().toLocaleDateString('en-CA'), []);
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [selectedTime, setSelectedTime] = useState<string>('');

  // Client Details
  const [clientName, setClientName] = useState<string>('');
  const [clientPhone, setClientPhone] = useState<string>('');
  const [clientNotes, setClientNotes] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);

  // Success result details
  const [bookedDetails, setBookedDetails] = useState<{
    service: string;
    professional: string;
    date: string;
    displayDate: string;
    time: string;
    price: number;
    clientName: string;
    clientPhone: string;
  } | null>(null);

  // Copy link feedback
  const [copiedLink, setCopiedLink] = useState(false);

  // Settings fallbacks
  const openingTime = settings.openingTime || '08:00';
  const closingTime = settings.closingTime || '20:00';
  const interval = settings.interval || 30;
  const workOnSaturdays = settings.workOnSaturdays ?? true;
  const workOnSundays = settings.workOnSundays ?? false;
  const workOnHolidays = settings.workOnHolidays ?? false;

  // Filtered Services list
  const activeServices = useMemo(() => {
    return services.filter(s => s.type === 'SERVICE');
  }, [services]);

  const categories = useMemo(() => {
    const cats = new Set<string>();
    activeServices.forEach(s => {
      if (s.categoryId) cats.add(s.categoryId);
    });
    return Array.from(cats);
  }, [activeServices]);

  const displayedServices = useMemo(() => {
    return activeServices.filter(s => {
      const matchCat = selectedCategory === 'ALL' || s.categoryId === selectedCategory;
      const matchSearch = s.name.toLowerCase().includes(searchService.toLowerCase()) ||
                          (s.description && s.description.toLowerCase().includes(searchService.toLowerCase()));
      return matchCat && matchSearch;
    });
  }, [activeServices, selectedCategory, searchService]);

  // Next 14 days calendar list with working day calculation
  const calendarDays = useMemo(() => {
    const days: Array<{
      dateStr: string;
      dayNum: number;
      weekdayShort: string;
      weekdayFull: string;
      monthShort: string;
      isWorking: boolean;
      nonWorkingReason: string | null;
    }> = [];

    const base = new Date();
    for (let i = 0; i < 21; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() + i);

      const dateStr = d.toLocaleDateString('en-CA');
      const dayNum = d.getDate();
      const weekdayShort = d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '').toUpperCase();
      const weekdayFull = d.toLocaleDateString('pt-BR', { weekday: 'long' });
      const monthShort = d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '').toUpperCase();

      const reason = getNonWorkingReason(d, workOnSaturdays, workOnSundays, workOnHolidays);
      const isWorking = !reason;

      days.push({
        dateStr,
        dayNum,
        weekdayShort,
        weekdayFull,
        monthShort,
        isWorking,
        nonWorkingReason: reason
      });
    }
    return days;
  }, [workOnSaturdays, workOnSundays, workOnHolidays]);

  // Ensure initial selected date is a working day
  useMemo(() => {
    const currentIsWorking = calendarDays.find(d => d.dateStr === selectedDate)?.isWorking;
    if (!currentIsWorking) {
      const firstWorking = calendarDays.find(d => d.isWorking);
      if (firstWorking) {
        setSelectedDate(firstWorking.dateStr);
      }
    }
  }, [calendarDays, selectedDate]);

  // Base time slots
  const allTimeSlots = useMemo(() => {
    return generateTimeSlots(openingTime, closingTime, interval);
  }, [openingTime, closingTime, interval]);

  // Slots availability for selected date & professional
  const availableSlots = useMemo(() => {
    const dayMeta = calendarDays.find(d => d.dateStr === selectedDate);
    if (!dayMeta || !dayMeta.isWorking) return [];

    // Appointments on the selected date
    const dayAppointments = appointments.filter(apt => 
      apt.rawDate === selectedDate && 
      apt.status !== 'Finalizado' &&
      apt.status !== 'Cancelado'
    );

    return allTimeSlots.map(time => {
      let isOccupied = false;

      if (selectedProfessional === 'ANY') {
        // If "ANY" professional, slot is occupied only if ALL professionals are busy at that time
        if (professionals.length > 0) {
          const busyProfsCount = dayAppointments.filter(apt => apt.time === time).length;
          isOccupied = busyProfsCount >= professionals.length;
        } else {
          isOccupied = dayAppointments.some(apt => apt.time === time);
        }
      } else {
        // If specific professional selected
        isOccupied = dayAppointments.some(apt => 
          apt.time === time && 
          (apt.professional === selectedProfessional.name || apt.professional === selectedProfessional.nickname)
        );
      }

      return {
        time,
        isOccupied
      };
    });
  }, [selectedDate, selectedProfessional, appointments, allTimeSlots, calendarDays, professionals]);

  // Group slots by period (Manhã, Tarde, Noite)
  const groupedSlots = useMemo(() => {
    const morning = availableSlots.filter(s => {
      const h = parseInt(s.time.split(':')[0], 10);
      return h < 12;
    });
    const afternoon = availableSlots.filter(s => {
      const h = parseInt(s.time.split(':')[0], 10);
      return h >= 12 && h < 18;
    });
    const evening = availableSlots.filter(s => {
      const h = parseInt(s.time.split(':')[0], 10);
      return h >= 18;
    });

    return { morning, afternoon, evening };
  }, [availableSlots]);

  // Format Phone Input
  const handlePhoneChange = (val: string) => {
    let clean = val.replace(/\D/g, '');
    if (clean.length > 11) clean = clean.slice(0, 11);

    let formatted = clean;
    if (clean.length > 2) {
      formatted = `(${clean.slice(0, 2)}) ${clean.slice(2)}`;
    }
    if (clean.length > 7) {
      formatted = `(${clean.slice(0, 2)}) ${clean.slice(2, 7)}-${clean.slice(7)}`;
    }
    setClientPhone(formatted);
  };

  // Submit Booking
  const handleConfirmBooking = () => {
    if (!selectedService) {
      setStep(1);
      return;
    }
    if (!selectedDate || !selectedTime) {
      setStep(3);
      return;
    }
    if (!clientName.trim()) {
      setFormError('Por favor, informe seu nome completo.');
      return;
    }
    if (clientPhone.replace(/\D/g, '').length < 10) {
      setFormError('Por favor, informe um número de WhatsApp válido com DDD.');
      return;
    }

    setFormError(null);

    // Resolve professional name
    let chosenProfName = 'Qualquer Profissional';
    if (selectedProfessional !== 'ANY') {
      chosenProfName = selectedProfessional.nickname || selectedProfessional.name;
    } else if (professionals.length > 0) {
      // Pick first free professional for this slot
      const busyNames = appointments
        .filter(apt => apt.rawDate === selectedDate && apt.time === selectedTime)
        .map(apt => apt.professional);
      const freeProf = professionals.find(p => !busyNames.includes(p.name) && !busyNames.includes(p.nickname));
      if (freeProf) {
        chosenProfName = freeProf.nickname || freeProf.name;
      } else {
        chosenProfName = professionals[0].nickname || professionals[0].name;
      }
    }

    // Save
    onSaveAppointment({
      date: selectedDate,
      time: selectedTime,
      service: selectedService.name,
      professional: chosenProfName,
      category: selectedService.categoryId || 'Serviço Online',
      client: {
        name: clientName.trim(),
        whatsapp: clientPhone.trim(),
        notes: clientNotes.trim() || undefined
      }
    });

    const dateObj = new Date(selectedDate + 'T12:00:00');
    const displayDate = dateObj.toLocaleDateString('pt-BR', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long' 
    });

    setBookedDetails({
      service: selectedService.name,
      professional: chosenProfName,
      date: selectedDate,
      displayDate: displayDate,
      time: selectedTime,
      price: selectedService.price,
      clientName: clientName.trim(),
      clientPhone: clientPhone.trim()
    });

    setStep(5);
  };

  // Share link handler
  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-gray-900 font-sans flex flex-col antialiased">
      {/* Top Banner / Navbar */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-30 shadow-xs">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src={company.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(company.name)}&background=f3e8ff&color=9333ea`} 
              alt={company.name} 
              className="w-10 h-10 rounded-2xl object-cover border border-purple-100 shadow-xs"
            />
            <div>
              <h1 className="font-bold text-gray-900 text-sm md:text-base leading-tight">
                {company.name}
              </h1>
              <p className="text-[11px] text-gray-500 font-medium">
                {company.subName || 'Agendamento Online 24h'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              title="Copiar Link da Agenda"
              className="p-2 text-gray-500 hover:text-purple-600 bg-gray-50 hover:bg-purple-50 rounded-xl transition-all border border-gray-100 flex items-center gap-1.5 text-xs font-semibold"
            >
              {copiedLink ? <Check size={14} className="text-emerald-500" /> : <Share2 size={14} />}
              <span className="hidden sm:inline">{copiedLink ? 'Copiado!' : 'Compartilhar'}</span>
            </button>

            {onExitPreview && (
              <button
                onClick={onExitPreview}
                className="px-3 py-1.5 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1"
              >
                <ArrowLeft size={14} /> Voltar ao Painel
              </button>
            )}
          </div>
        </div>

        {/* Stepper (Steps 1 to 4) */}
        {step < 5 && (
          <div className="max-w-2xl mx-auto px-4 pb-3 pt-1">
            <div className="flex items-center justify-between relative">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-gray-100 w-full -z-0"></div>
              <div 
                className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-purple-600 transition-all duration-300 -z-0"
                style={{ width: `${((step - 1) / 3) * 100}%` }}
              ></div>

              {[
                { s: 1, label: 'Serviço' },
                { s: 2, label: 'Profissional' },
                { s: 3, label: 'Horário' },
                { s: 4, label: 'Confirmação' },
              ].map(item => {
                const isActive = step === item.s;
                const isPassed = step > item.s;

                return (
                  <button
                    key={item.s}
                    onClick={() => {
                      if (isPassed) setStep(item.s as any);
                    }}
                    disabled={!isPassed && !isActive}
                    className={`relative z-10 flex flex-col items-center gap-1 focus:outline-none ${isPassed ? 'cursor-pointer' : ''}`}
                  >
                    <div 
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        isPassed 
                          ? 'bg-purple-600 text-white shadow-xs' 
                          : isActive 
                            ? 'bg-purple-600 text-white ring-4 ring-purple-100 shadow-xs' 
                            : 'bg-white text-gray-400 border border-gray-200'
                      }`}
                    >
                      {isPassed ? <Check size={12} strokeWidth={3} /> : item.s}
                    </div>
                    <span className={`text-[10px] font-semibold ${isActive ? 'text-purple-700' : 'text-gray-400'}`}>
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-2xl w-full mx-auto p-4 md:py-6">
        
        {/* ========================================================= */}
        {/* PASSO 1: ESCOLHER O SERVIÇO */}
        {/* ========================================================= */}
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div>
              <h2 className="text-xl font-bold text-gray-900 tracking-tight">
                Selecione o Serviço Desejado
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Escolha o procedimento para ver os dias e horários livres.
              </p>
            </div>

            {/* Category Filter Pills */}
            {categories.length > 0 && (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
                <button
                  type="button"
                  onClick={() => setSelectedCategory('ALL')}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                    selectedCategory === 'ALL'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Todos os Serviços
                </button>
                {categories.map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                      selectedCategory === cat
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}

            {/* Service Cards Grid */}
            <div className="space-y-2.5">
              {displayedServices.map(service => {
                const isSelected = selectedService?.id === service.id;

                return (
                  <div
                    key={service.id}
                    onClick={() => {
                      setSelectedService(service);
                      setStep(2);
                    }}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer bg-white flex items-center justify-between gap-3 hover:border-purple-300 hover:shadow-xs active:scale-[0.99] ${
                      isSelected 
                        ? 'border-purple-600 ring-2 ring-purple-100 shadow-xs' 
                        : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 mt-0.5">
                        <Scissors size={20} />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-sm leading-snug">
                          {service.name}
                        </h3>
                        {service.description && (
                          <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">
                            {service.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[11px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                            <Clock size={10} /> 30-45 min
                          </span>
                          {service.categoryId && (
                            <span className="text-[11px] font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                              {service.categoryId}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-sm md:text-base font-extrabold text-gray-900">
                        R$ {Number(service.price).toFixed(2).replace('.', ',')}
                      </div>
                      <span className="inline-block mt-1 text-[11px] font-bold text-purple-600 hover:underline">
                        Escolher &rarr;
                      </span>
                    </div>
                  </div>
                );
              })}

              {displayedServices.length === 0 && (
                <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-gray-200 p-6">
                  <Scissors size={32} className="mx-auto text-gray-300 mb-2" />
                  <p className="text-sm font-semibold text-gray-600">Nenhum serviço encontrado.</p>
                  <p className="text-xs text-gray-400 mt-1">Tente selecionar outra categoria.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* PASSO 2: ESCOLHER O PROFISSIONAL */}
        {/* ========================================================= */}
        {step === 2 && selectedService && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <button
              onClick={() => setStep(1)}
              className="inline-flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-purple-600 mb-1"
            >
              <ChevronLeft size={16} /> Voltar aos serviços
            </button>

            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-purple-50 text-purple-700 rounded-lg text-xs font-bold mb-2">
                <Scissors size={12} /> {selectedService.name} • R$ {Number(selectedService.price).toFixed(2).replace('.', ',')}
              </div>
              <h2 className="text-xl font-bold text-gray-900 tracking-tight">
                Deseja escolher um profissional?
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Você pode escolher seu especialista de confiança ou deixar que o estúdio selecione quem estiver livre.
              </p>
            </div>

            <div className="space-y-2.5">
              {/* Opção Sem Preferência */}
              <div
                onClick={() => {
                  setSelectedProfessional('ANY');
                  setStep(3);
                }}
                className={`p-4 rounded-2xl border transition-all cursor-pointer bg-white flex items-center justify-between gap-3 hover:border-purple-300 hover:shadow-xs active:scale-[0.99] ${
                  selectedProfessional === 'ANY'
                    ? 'border-purple-600 ring-2 ring-purple-100 shadow-xs'
                    : 'border-gray-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">
                      Qualquer Profissional Disponível
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Mais opções de horários e agendamento mais rápido.
                    </p>
                  </div>
                </div>

                <span className="text-xs font-bold text-purple-600 shrink-0">
                  Mais rápido &rarr;
                </span>
              </div>

              {/* Lista de Profissionais */}
              {professionals.map(prof => {
                const isSelected = selectedProfessional !== 'ANY' && selectedProfessional.id === prof.id;

                return (
                  <div
                    key={prof.id}
                    onClick={() => {
                      setSelectedProfessional(prof);
                      setStep(3);
                    }}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer bg-white flex items-center justify-between gap-3 hover:border-purple-300 hover:shadow-xs active:scale-[0.99] ${
                      isSelected
                        ? 'border-purple-600 ring-2 ring-purple-100 shadow-xs'
                        : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img 
                        src={prof.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(prof.name)}&background=f3e8ff&color=9333ea`} 
                        alt={prof.name} 
                        className="w-12 h-12 rounded-full object-cover border border-purple-100 shadow-xs shrink-0"
                      />
                      <div>
                        <h3 className="font-bold text-gray-900 text-sm">
                          {prof.nickname || prof.name}
                        </h3>
                        <p className="text-xs text-purple-600 font-medium">
                          Especialista
                        </p>
                      </div>
                    </div>

                    <span className="text-xs font-bold text-purple-600 shrink-0">
                      Selecionar &rarr;
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* PASSO 3: ESCOLHER DATA E HORÁRIO */}
        {/* ========================================================= */}
        {step === 3 && selectedService && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <button
              onClick={() => setStep(2)}
              className="inline-flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-purple-600 mb-1"
            >
              <ChevronLeft size={16} /> Voltar à escolha do profissional
            </button>

            <div>
              <div className="flex flex-wrap gap-2 mb-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-50 text-purple-700 rounded-lg text-xs font-bold">
                  <Scissors size={12} /> {selectedService.name}
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-bold">
                  <User size={12} /> {selectedProfessional === 'ANY' ? 'Qualquer Profissional' : (selectedProfessional.nickname || selectedProfessional.name)}
                </span>
              </div>
              <h2 className="text-xl font-bold text-gray-900 tracking-tight">
                Selecione o Dia e o Horário
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Os horários livres são atualizados automaticamente em tempo real.
              </p>
            </div>

            {/* Date Strip */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                1. Escolha a data
              </label>

              <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                {calendarDays.map(d => {
                  const isSelected = selectedDate === d.dateStr;
                  const isWorking = d.isWorking;

                  return (
                    <button
                      key={d.dateStr}
                      type="button"
                      disabled={!isWorking}
                      onClick={() => {
                        setSelectedDate(d.dateStr);
                        setSelectedTime('');
                      }}
                      className={`p-3 rounded-2xl border text-center transition-all shrink-0 min-w-[70px] flex flex-col items-center justify-center gap-1 ${
                        !isWorking 
                          ? 'bg-gray-100/70 border-gray-200 text-gray-400 opacity-50 cursor-not-allowed'
                          : isSelected
                            ? 'bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-100 ring-2 ring-purple-200'
                            : 'bg-white border-gray-200 text-gray-800 hover:border-purple-300'
                      }`}
                    >
                      <span className={`text-[10px] font-bold uppercase ${isSelected ? 'text-purple-100' : 'text-gray-400'}`}>
                        {d.weekdayShort}
                      </span>
                      <span className="text-lg font-black leading-none">
                        {d.dayNum}
                      </span>
                      <span className={`text-[10px] font-semibold ${isSelected ? 'text-purple-100' : 'text-gray-400'}`}>
                        {d.monthShort}
                      </span>
                      {!isWorking && (
                        <span className="text-[8px] font-bold text-rose-500 mt-0.5">Fechado</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Time Slots Grid */}
            <div className="space-y-4">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                2. Escolha o horário disponível
              </label>

              {/* Manhã */}
              {groupedSlots.morning.length > 0 && (
                <div>
                  <span className="text-xs font-bold text-gray-500 mb-2 block flex items-center gap-1">
                    <Clock size={12} className="text-amber-500" /> Manhã
                  </span>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {groupedSlots.morning.map(slot => {
                      const isSelected = selectedTime === slot.time;
                      return (
                        <button
                          key={slot.time}
                          type="button"
                          disabled={slot.isOccupied}
                          onClick={() => {
                            setSelectedTime(slot.time);
                            setStep(4);
                          }}
                          className={`py-2.5 px-2 rounded-xl text-xs font-bold border transition-all text-center ${
                            slot.isOccupied
                              ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed line-through'
                              : isSelected
                                ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                                : 'bg-white border-gray-200 text-gray-800 hover:border-purple-400 hover:bg-purple-50/50'
                          }`}
                        >
                          {slot.time}
                          {slot.isOccupied && <span className="block text-[8px] font-normal no-underline text-gray-400">Ocupado</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Tarde */}
              {groupedSlots.afternoon.length > 0 && (
                <div>
                  <span className="text-xs font-bold text-gray-500 mb-2 block flex items-center gap-1">
                    <Clock size={12} className="text-orange-500" /> Tarde
                  </span>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {groupedSlots.afternoon.map(slot => {
                      const isSelected = selectedTime === slot.time;
                      return (
                        <button
                          key={slot.time}
                          type="button"
                          disabled={slot.isOccupied}
                          onClick={() => {
                            setSelectedTime(slot.time);
                            setStep(4);
                          }}
                          className={`py-2.5 px-2 rounded-xl text-xs font-bold border transition-all text-center ${
                            slot.isOccupied
                              ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed line-through'
                              : isSelected
                                ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                                : 'bg-white border-gray-200 text-gray-800 hover:border-purple-400 hover:bg-purple-50/50'
                          }`}
                        >
                          {slot.time}
                          {slot.isOccupied && <span className="block text-[8px] font-normal no-underline text-gray-400">Ocupado</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Noite */}
              {groupedSlots.evening.length > 0 && (
                <div>
                  <span className="text-xs font-bold text-gray-500 mb-2 block flex items-center gap-1">
                    <Clock size={12} className="text-indigo-500" /> Noite
                  </span>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {groupedSlots.evening.map(slot => {
                      const isSelected = selectedTime === slot.time;
                      return (
                        <button
                          key={slot.time}
                          type="button"
                          disabled={slot.isOccupied}
                          onClick={() => {
                            setSelectedTime(slot.time);
                            setStep(4);
                          }}
                          className={`py-2.5 px-2 rounded-xl text-xs font-bold border transition-all text-center ${
                            slot.isOccupied
                              ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed line-through'
                              : isSelected
                                ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                                : 'bg-white border-gray-200 text-gray-800 hover:border-purple-400 hover:bg-purple-50/50'
                          }`}
                        >
                          {slot.time}
                          {slot.isOccupied && <span className="block text-[8px] font-normal no-underline text-gray-400">Ocupado</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* PASSO 4: DADOS DO CLIENTE & CONFIRMAÇÃO */}
        {/* ========================================================= */}
        {step === 4 && selectedService && selectedTime && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <button
              onClick={() => setStep(3)}
              className="inline-flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-purple-600 mb-1"
            >
              <ChevronLeft size={16} /> Alterar data ou horário
            </button>

            <div>
              <h2 className="text-xl font-bold text-gray-900 tracking-tight">
                Quase lá! Informe seus dados
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Usaremos seu WhatsApp apenas para confirmar seu horário e enviar lembretes.
              </p>
            </div>

            {/* Summary Ticket */}
            <div className="bg-purple-50/60 rounded-2xl p-4 border border-purple-100 space-y-2.5">
              <div className="text-xs font-bold text-purple-800 uppercase tracking-wider">
                Resumo da Sua Reserva
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-gray-500 block text-[11px]">Procedimento</span>
                  <span className="font-bold text-gray-900">{selectedService.name}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[11px]">Valor</span>
                  <span className="font-extrabold text-purple-700">R$ {Number(selectedService.price).toFixed(2).replace('.', ',')}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[11px]">Profissional</span>
                  <span className="font-bold text-gray-900">
                    {selectedProfessional === 'ANY' ? 'Qualquer Disponível' : (selectedProfessional.nickname || selectedProfessional.name)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[11px]">Data e Hora</span>
                  <span className="font-bold text-emerald-700">
                    {new Date(selectedDate + 'T12:00:00').toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })} às {selectedTime}
                  </span>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="space-y-3.5 bg-white p-5 rounded-2xl border border-gray-200">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Seu Nome Completo *
                </label>
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Ex: Amanda Silva"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Seu WhatsApp / Telefone com DDD *
                </label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="tel"
                    placeholder="(00) 00000-0000"
                    value={clientPhone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Observações ou Preferências (opcional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Ex: Primeira vez no estúdio / preferência de esmalte / etc."
                  value={clientNotes}
                  onChange={(e) => setClientNotes(e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:bg-white transition-all resize-none"
                />
              </div>

              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-bold flex items-center gap-2">
                  <AlertCircle size={16} />
                  <span>{formError}</span>
                </div>
              )}

              <button
                type="button"
                onClick={handleConfirmBooking}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-sm font-black uppercase tracking-wider shadow-lg shadow-purple-200 hover:shadow-xl transition-all active:scale-[0.99] flex items-center justify-center gap-2"
              >
                <CheckCircle2 size={18} /> Confirmar Meu Agendamento
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* PASSO 5: TELA DE SUCESSO & COMPROVANTE */}
        {/* ========================================================= */}
        {step === 5 && bookedDetails && (
          <div className="text-center py-6 px-2 space-y-6 animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-md shadow-emerald-50">
              <CheckCircle2 size={42} strokeWidth={2.5} />
            </div>

            <div>
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                Agendamento Solicitado com Sucesso!
              </h2>
              <p className="text-xs md:text-sm text-gray-600 mt-1 max-w-md mx-auto">
                Seu horário foi reservado no sistema e nossa equipe já recebeu sua solicitação para confirmação.
              </p>
            </div>

            {/* Ticket Card */}
            <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm max-w-md mx-auto text-left space-y-4">
              <div className="border-b border-gray-100 pb-3 flex justify-between items-center">
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Local</span>
                  <span className="font-bold text-gray-800 text-sm">{company.name}</span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                  Aguardando Confirmação
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">Serviço:</span>
                  <span className="font-bold text-gray-800">{bookedDetails.service}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Profissional:</span>
                  <span className="font-bold text-gray-800">{bookedDetails.professional}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Data:</span>
                  <span className="font-bold text-purple-700 capitalize">{bookedDetails.displayDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Horário:</span>
                  <span className="font-bold text-purple-700">{bookedDetails.time}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Cliente:</span>
                  <span className="font-bold text-gray-800">{bookedDetails.clientName}</span>
                </div>
                <div className="flex justify-between border-t border-gray-100 pt-2 font-bold">
                  <span className="text-gray-700">Valor Estimado:</span>
                  <span className="text-emerald-600">R$ {Number(bookedDetails.price).toFixed(2).replace('.', ',')}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="max-w-md mx-auto space-y-2.5">
              <a
                href={`https://wa.me/?text=${encodeURIComponent(
                  `Olá! Acabei de fazer um agendamento online no ${company.name}:\n\n` +
                  `✨ *Serviço:* ${bookedDetails.service}\n` +
                  `📅 *Data:* ${bookedDetails.displayDate}\n` +
                  `⏰ *Horário:* ${bookedDetails.time}\n` +
                  `👤 *Profissional:* ${bookedDetails.professional}\n` +
                  `📝 *Nome:* ${bookedDetails.clientName}\n\n` +
                  `Aguardo a confirmação da equipe. Obrigado!`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <MessageCircle size={16} /> Notificar no WhatsApp do Studio
              </a>

              <button
                type="button"
                onClick={() => {
                  setSelectedService(null);
                  setSelectedTime('');
                  setClientName('');
                  setClientPhone('');
                  setClientNotes('');
                  setStep(1);
                }}
                className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors"
              >
                Fazer Outro Agendamento
              </button>
            </div>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-4 text-center text-xs text-gray-400">
        <p>Agendamento Inteligente • {company.name}</p>
      </footer>
    </div>
  );
};
