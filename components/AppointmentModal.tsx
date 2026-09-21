
import React, { useState, useMemo, useEffect } from 'react';
import { X, Calendar, Clock, User, CheckCircle2, AlertCircle, Scissors, Layers, Tag } from 'lucide-react';
import { Client, Product, Appointment, Promotion, Professional } from '../types';
import { getNonWorkingReason } from '../services/scheduleUtils';

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { date: string; time: string; service: string; professional: string; category: string }) => void;
  client: Client | null;
  services: Product[];
  appointments: Appointment[];
  professionals?: Professional[];
  settings: {
    openingTime: string;
    closingTime: string;
    interval: number;
    workOnSaturdays?: boolean;
    workOnSundays?: boolean;
    workOnHolidays?: boolean;
  };
  initialDate?: string;
  initialTime?: string;
  fixedService?: string | null; 
  promotions?: Promotion[];
}

const generateSlots = (start: string, end: string, intervalMinutes: number) => {
    const slots = [];
    const [startH, startM] = start.split(':').map(Number);
    const [endH, endM] = end.split(':').map(Number);
    
    let current = new Date();
    current.setHours(startH, startM, 0, 0);
    
    const endTime = new Date();
    endTime.setHours(endH, endM, 0, 0);

    while (current <= endTime) {
        const h = String(current.getHours()).padStart(2, '0');
        const m = String(current.getMinutes()).padStart(2, '0');
        slots.push(`${h}:${m}`);
        current.setMinutes(current.getMinutes() + intervalMinutes);
    }
    return slots;
};

interface ServiceCardProps {
    service: Product;
    isSelected: boolean;
    onSelect: (id: string) => void;
    activePromo?: Promotion;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service, isSelected, onSelect, activePromo }) => {
    const isPackage = service.subtype === 'PACKAGE';
    const displayPrice = activePromo ? activePromo.promoPrice : service.price;
    
    return (
        <button
            onClick={() => onSelect(service.id)}
            className={`flex items-center p-3 rounded-xl border text-left transition-all w-full ${
                isSelected 
                ? 'border-purple-500 bg-purple-50 ring-1 ring-purple-500' 
                : 'border-gray-200 hover:border-purple-200 hover:bg-gray-50'
            }`}
        >
            <div className={`p-2 rounded-lg mr-3 shrink-0 ${isSelected ? 'bg-white text-purple-600' : 'bg-gray-100 text-gray-500'}`}>
                {isPackage ? <Layers size={18} /> : <Scissors size={18} />}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <div className={`font-bold text-sm truncate ${isSelected ? 'text-purple-900' : 'text-gray-700'}`}>{service.name}</div>
                    {isPackage && <span className="text-[10px] font-bold bg-purple-200 text-purple-700 px-1.5 py-0.5 rounded">PKG</span>}
                    {activePromo && (
                        <div className="flex items-center gap-1 bg-emerald-100 text-emerald-700 text-[8px] font-black px-1 py-0.5 rounded uppercase">
                            <Tag size={8} /> Promo
                        </div>
                    )}
                </div>
                <div className="text-xs text-gray-400">
                    {activePromo ? (
                        <span className="flex items-center gap-1">
                            <span className="line-through text-[10px]">R$ {service.price.toFixed(2)}</span>
                            <span className="font-bold text-emerald-600">R$ {activePromo.promoPrice.toFixed(2)}</span>
                        </span>
                    ) : (
                        `R$ ${service.price.toFixed(2)}`
                    )} 
                    {isPackage && ` • ${service.sessionCount} sessões`}
                </div>
            </div>
            {isSelected && <CheckCircle2 size={18} className="text-purple-600 shrink-0" />}
        </button>
    );
};

export const AppointmentModal: React.FC<AppointmentModalProps> = ({ 
    isOpen, 
    onClose, 
    onSave, 
    client, 
    services, 
    appointments,
    professionals = [],
    settings,
    initialDate,
    initialTime,
    fixedService,
    promotions = []
}) => {
    // Correct local date string YYYY-MM-DD
    const todayLocal = useMemo(() => new Date().toLocaleDateString('en-CA'), []);

    const defaultProfName = useMemo(() => {
        return professionals.length > 0 ? (professionals[0].nickname || professionals[0].name) : 'Geral';
    }, [professionals]);

    const [date, setDate] = useState(todayLocal);
    const [time, setTime] = useState('');
    const [selectedServiceId, setSelectedServiceId] = useState('');
    const [professional, setProfessional] = useState(defaultProfName);
    const [activeTab, setActiveTab] = useState<'SINGLE' | 'PACKAGE'>('SINGLE');

    useEffect(() => {
        if (isOpen) {
            setDate(initialDate || todayLocal);
            setTime(initialTime || '');
            setProfessional(defaultProfName);
            setActiveTab('SINGLE');
            
            if (fixedService) {
                const found = services.find(s => s.name === fixedService);
                if (found) setSelectedServiceId(found.id);
            } else {
                setSelectedServiceId('');
            }
        }
    }, [isOpen, initialDate, initialTime, fixedService, services, todayLocal, defaultProfName]);

    const nonWorkingReason = useMemo(() => {
        if (!date) return null;
        const worksSat = settings.workOnSaturdays ?? true;
        const worksSun = settings.workOnSundays ?? false;
        const worksHol = settings.workOnHolidays ?? false;
        return getNonWorkingReason(date, worksSat, worksSun, worksHol);
    }, [date, settings.workOnSaturdays, settings.workOnSundays, settings.workOnHolidays]);

    const allSlots = useMemo(() => {
        if (nonWorkingReason) return [];
        return generateSlots(settings.openingTime, settings.closingTime, settings.interval);
    }, [settings, nonWorkingReason]);

    const busyTimes = useMemo(() => {
        if (!date) return [];
        return appointments
            .filter(apt => apt.rawDate === date && apt.status !== 'Cancelado' && (!professional || apt.professional === professional))
            .map(apt => apt.time);
    }, [date, appointments, professional]);

    const availableSlots = useMemo(() => {
        if (!date || nonWorkingReason) return [];
        
        const now = new Date();
        const isToday = date === todayLocal;
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();

        return allSlots.filter(slot => {
            if (busyTimes.includes(slot)) return false;

            if (isToday) {
                const [h, m] = slot.split(':').map(Number);
                if (h < currentHour) return false;
                if (h === currentHour && m < currentMinute) return false;
            }
            return true;
        });
    }, [date, nonWorkingReason, busyTimes, allSlots, todayLocal]);

    const { singles, packages } = useMemo(() => {
        return {
            singles: services.filter(s => s.subtype !== 'PACKAGE'),
            packages: services.filter(s => s.subtype === 'PACKAGE')
        };
    }, [services]);

    const findActivePromo = (itemId: string) => {
        const today = new Date().toLocaleDateString('en-CA');
        return promotions.find(p => 
            p.itemId === itemId && 
            p.active &&
            p.expiryDate >= today && 
            (p.targetClientIds.length === 0 || (client && p.targetClientIds.includes(client.id)))
        );
    };

    const handleSubmit = () => {
        if (fixedService) {
            if (date && time) {
                onSave({
                    date,
                    time,
                    service: fixedService,
                    professional,
                    category: 'PACOTE'
                });
            }
            return;
        }

        const service = services.find(s => s.id === selectedServiceId);
        if (date && time && service) {
            onSave({
                date,
                time,
                service: service.name,
                professional,
                category: service.subtype === 'PACKAGE' ? 'PACOTE' : 'SERVIÇO AVULSO'
            });
        }
    };

    if (!isOpen || !client) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-lilac-900/30 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
                <div className="bg-white p-6 border-b border-gray-100 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            {client.avatar ? (
                                <img src={client.avatar} alt={client.name} className="w-12 h-12 rounded-full object-cover border-2 border-purple-100" />
                            ) : (
                                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-lg">
                                    {client.name.charAt(0)}
                                </div>
                            )}
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-800">
                                {fixedService ? 'Agendar Sessão' : 'Novo Agendamento'}
                            </h3>
                            <p className="text-xs text-gray-500">Para: <span className="font-bold text-purple-600">{client.nickname || client.name}</span></p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-50 rounded-full transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto space-y-6 custom-scrollbar">
                    {fixedService ? (
                        <div className="bg-purple-50 p-4 rounded-xl border border-purple-100 flex items-center gap-3">
                             <div className="bg-white p-2 rounded-lg text-purple-600 shadow-sm">
                                 <Layers size={20} />
                             </div>
                             <div>
                                 <div className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">Agendando para</div>
                                 <div className="font-bold text-gray-800">{fixedService}</div>
                             </div>
                        </div>
                    ) : (
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Selecione o Procedimento</label>
                            <div className="flex bg-gray-100 p-1 rounded-xl mb-4">
                                <button
                                    onClick={() => setActiveTab('SINGLE')}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
                                        activeTab === 'SINGLE' 
                                        ? 'bg-white text-purple-600 shadow-sm' 
                                        : 'text-gray-400 hover:text-gray-600'
                                    }`}
                                >
                                    <Scissors size={14} />
                                    Serviços
                                </button>
                                <button
                                    onClick={() => setActiveTab('PACKAGE')}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
                                        activeTab === 'PACKAGE' 
                                        ? 'bg-white text-purple-600 shadow-sm' 
                                        : 'text-gray-400 hover:text-gray-600'
                                    }`}
                                >
                                    <Layers size={14} />
                                    Pacotes
                                </button>
                            </div>
                            <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                                {activeTab === 'SINGLE' ? (
                                    singles.length > 0 ? (
                                        singles.map(svc => (
                                            <ServiceCard 
                                                key={svc.id} 
                                                service={svc} 
                                                isSelected={selectedServiceId === svc.id} 
                                                onSelect={setSelectedServiceId}
                                                activePromo={findActivePromo(svc.id)}
                                            />
                                        ))
                                    ) : (
                                        <div className="text-center py-8 text-gray-400 text-xs italic border border-dashed border-gray-200 rounded-xl">Nenhum serviço avulso.</div>
                                    )
                                ) : (
                                    packages.length > 0 ? (
                                        packages.map(pkg => (
                                            <ServiceCard 
                                                key={pkg.id} 
                                                service={pkg} 
                                                isSelected={selectedServiceId === pkg.id} 
                                                onSelect={setSelectedServiceId}
                                                activePromo={findActivePromo(pkg.id)}
                                            />
                                        ))
                                    ) : (
                                        <div className="text-center py-8 text-gray-400 text-xs italic border border-dashed border-gray-200 rounded-xl">Nenhum pacote promocional.</div>
                                    )
                                )}
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Data</label>
                        <div className="relative">
                            <input 
                                type="date" 
                                value={date}
                                onChange={(e) => {
                                    setDate(e.target.value);
                                    setTime('');
                                }}
                                min={todayLocal}
                                className="w-full p-3 pl-10 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-200 outline-none font-bold text-gray-700 cursor-pointer"
                            />
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                        </div>
                    </div>

                    <div className="animate-in slide-in-from-bottom-2 duration-300">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Horários Disponíveis</label>
                        {!date ? (
                            <div className="text-center py-6 text-gray-400 text-sm bg-gray-50 rounded-xl border border-dashed border-gray-200">Selecione uma data primeiro.</div>
                        ) : nonWorkingReason ? (
                            <div className="text-center py-4 px-3 text-amber-700 text-xs bg-amber-50 rounded-xl border border-amber-200 font-bold">
                                <AlertCircle className="mx-auto mb-1 text-amber-500" size={18} />
                                {nonWorkingReason}
                                <div className="text-[11px] font-normal text-amber-600 mt-1">Selecione uma data útil com expediente para visualizar os horários livres.</div>
                            </div>
                        ) : availableSlots.length > 0 ? (
                            <div className="grid grid-cols-4 gap-2 max-h-40 overflow-y-auto custom-scrollbar pr-1">
                                {availableSlots.map((slot) => (
                                    <button
                                        key={slot}
                                        onClick={() => setTime(slot)}
                                        className={`py-2 rounded-lg text-sm font-bold transition-all border ${
                                            time === slot 
                                                ? 'bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-200' 
                                                : 'bg-white text-gray-600 border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                                        }`}
                                    >
                                        {slot}
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-4 text-rose-400 text-sm bg-rose-50 rounded-xl border border-rose-100 font-bold">
                                <AlertCircle className="mx-auto mb-1" size={18} />
                                Sem horários livres hoje para este profissional.
                            </div>
                        )}
                    </div>
                    
                    <div>
                         <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Profissional</label>
                         {professionals.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-36 overflow-y-auto custom-scrollbar p-1">
                               {professionals.map(prof => {
                                   const profName = prof.nickname || prof.name;
                                   const isSelected = professional === profName;
                                   return (
                                       <button
                                           key={prof.id}
                                           type="button"
                                           onClick={() => {
                                               setProfessional(profName);
                                               setTime('');
                                           }}
                                           className={`flex items-center gap-2 p-2 rounded-xl border text-xs font-bold transition-all text-left ${
                                               isSelected
                                               ? 'bg-purple-100 text-purple-800 border-purple-300 ring-2 ring-purple-300 shadow-xs'
                                               : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-purple-200'
                                           }`}
                                       >
                                           {prof.avatar ? (
                                               <img src={prof.avatar} alt={profName} className="w-6 h-6 rounded-full object-cover shrink-0 border border-white shadow-xs" />
                                           ) : (
                                               <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-[10px] shrink-0">
                                                   {profName.charAt(0)}
                                               </div>
                                           )}
                                           <span className="truncate">{profName}</span>
                                       </button>
                                   );
                               })}
                            </div>
                         ) : (
                            <input 
                                type="text"
                                value={professional}
                                onChange={(e) => setProfessional(e.target.value)}
                                placeholder="Nome do profissional"
                                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-200 outline-none font-bold text-gray-700"
                            />
                         )}
                    </div>
                </div>

                <div className="p-6 border-t border-gray-100 bg-gray-50">
                    <button 
                        onClick={handleSubmit}
                        disabled={!date || !time || (!selectedServiceId && !fixedService)}
                        className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold text-lg shadow-lg shadow-purple-200 hover:shadow-xl hover:scale-[1.01] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        <CheckCircle2 size={20} />
                        Confirmar Agendamento
                    </button>
                </div>
            </div>
        </div>
    );
};
