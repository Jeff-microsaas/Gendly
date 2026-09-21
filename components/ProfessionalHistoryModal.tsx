import React, { useMemo } from 'react';
import { X, Calendar, User, Scissors, History, Layers } from 'lucide-react';
import { Professional, Appointment, Client } from '../types';

interface ProfessionalHistoryModalProps {
  professional: Professional | null;
  isOpen: boolean;
  onClose: () => void;
  appointments: Appointment[];
  clients: Client[];
}

export const ProfessionalHistoryModal: React.FC<ProfessionalHistoryModalProps> = ({ 
    professional, 
    isOpen, 
    onClose, 
    appointments,
    clients 
}) => {
  const historyData = useMemo(() => {
    if (!professional) return { list: [], totalServices: 0, uniqueClients: 0 };

    // Filter appointments where the professional matches (by nickname or name)
    // and exclude cancelled ones to show actual work done.
    const list = appointments.filter(apt => 
        (apt.professional === professional.nickname || apt.professional === professional.name) &&
        apt.status !== 'Cancelado'
    ).sort((a, b) => {
        // Sort by Date Descending
        const dateA = new Date(`${a.rawDate}T${a.time}`);
        const dateB = new Date(`${b.rawDate}T${b.time}`);
        return dateB.getTime() - dateA.getTime();
    });

    const uniqueClientNames = new Set(list.map(a => a.client));

    return {
        list,
        totalServices: list.length,
        uniqueClients: uniqueClientNames.size
    };
  }, [professional, appointments]);

  if (!isOpen || !professional) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
       <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
          
          {/* Header */}
          <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white">
              <div className="flex items-center gap-4">
                  <div className="relative">
                      {professional.avatar ? (
                          <img src={professional.avatar} alt={professional.name} className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-md" />
                      ) : (
                          <div className="w-16 h-16 rounded-full bg-lilac-100 flex items-center justify-center text-lilac-600 font-bold text-2xl">
                              {professional.name.charAt(0)}
                          </div>
                      )}
                  </div>
                  <div>
                      <h3 className="text-xl font-bold text-gray-800">{professional.nickname || professional.name}</h3>
                      <p className="text-sm text-gray-500">{professional.name}</p>
                  </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X /></button>
          </div>
          
          {/* Stats Bar */}
          <div className="grid grid-cols-2 border-b border-gray-100 bg-gray-50/50">
              <div className="p-4 text-center border-r border-gray-100">
                  <div className="text-2xl font-black text-purple-600">{historyData.totalServices}</div>
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Serviços Realizados</div>
              </div>
              <div className="p-4 text-center">
                  <div className="text-2xl font-black text-blue-600">{historyData.uniqueClients}</div>
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Clientes Atendidos</div>
              </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/30">
             {historyData.list.length > 0 ? (
                 historyData.list.map(apt => {
                     const isConfirmed = apt.status === 'Confirmado' || apt.status === 'Finalizado';
                     const isPackage = apt.category?.toUpperCase().includes('PACOTE');
                     
                     // Find rich client data for avatar if available
                     const clientData = clients.find(c => c.name === apt.client);

                     return (
                         <div key={apt.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center gap-4 transition-all hover:shadow-md">
                             
                             {/* Date Box */}
                             <div className="flex md:flex-col items-center justify-center gap-2 md:gap-0 bg-gray-50 rounded-xl p-3 min-w-[5rem] border border-gray-100">
                                 <span className="text-xl font-bold text-gray-800 leading-none">{apt.date.split(' ')[0]}</span>
                                 <span className="text-[10px] font-bold text-gray-400 uppercase">{apt.date.split(' ')[2]?.replace('.', '') || 'MES'}</span>
                                 <span className="text-xs font-medium text-gray-500 md:mt-1">{apt.time}</span>
                             </div>

                             {/* Info */}
                             <div className="flex-1 min-w-0">
                                 <div className="flex items-center gap-2 mb-1">
                                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 text-[10px] font-bold uppercase">
                                        {isPackage ? <Layers size={10} /> : <Scissors size={10} />}
                                        {isPackage ? 'Pacote' : 'Serviço'}
                                    </div>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${isConfirmed ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'}`}>
                                        {apt.status}
                                    </span>
                                 </div>
                                 <h4 className="font-bold text-gray-800 text-sm truncate">{apt.service}</h4>
                                 
                                 {/* Client Mini Row */}
                                 <div className="flex items-center gap-2 mt-2">
                                     {clientData?.avatar ? (
                                         <img src={clientData.avatar} className="w-5 h-5 rounded-full object-cover" alt="" />
                                     ) : (
                                         <div className="w-5 h-5 rounded-full bg-lilac-100 flex items-center justify-center text-[10px] text-lilac-600 font-bold">
                                             <User size={10} />
                                         </div>
                                     )}
                                     <span className="text-xs text-gray-600 font-medium">{apt.client}</span>
                                 </div>
                             </div>
                         </div>
                     )
                 })
             ) : (
                 <div className="text-center py-12 text-gray-400 flex flex-col items-center">
                     <History size={48} className="mb-3 opacity-20" />
                     <p>Nenhum histórico de atendimento encontrado.</p>
                 </div>
             )}
          </div>
       </div>
    </div>
  );
};