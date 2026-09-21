import React from 'react';
import { XCircle, Trophy, Layers, CheckCircle2 } from 'lucide-react';

interface PackageConclusionModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: {
    id: number;
    client: string;
    avatar: string;
    service: string;
    total: number;
  } | null;
  onRenew: () => void;
  onEnd: () => void;
}

export const PackageConclusionModal: React.FC<PackageConclusionModalProps> = ({ isOpen, onClose, data, onRenew, onEnd }) => {
  if (!isOpen || !data) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden relative border border-purple-100 flex flex-col">
        
        {/* Header / Celebration Banner */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-8 text-center relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/diagonal-stripes.png')] opacity-10"></div>
           
           <div className="relative z-10 flex flex-col items-center">
               <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mb-4 text-white shadow-inner ring-4 ring-white/10">
                  <Trophy size={32} fill="currentColor" />
               </div>
               <h2 className="text-white font-black text-2xl tracking-tight">Pacote Concluído!</h2>
               <p className="text-purple-100 text-sm font-medium">Todas as sessões foram realizadas.</p>
           </div>
        </div>

        <div className="p-8 -mt-6 bg-white rounded-t-[2rem] relative z-20 flex flex-col items-center">
           
           {/* Client Avatar */}
           <div className="relative mb-6 -mt-12">
               <div className="relative w-24 h-24 rounded-full border-[6px] border-white shadow-xl overflow-hidden bg-gray-100">
                  <img src={data.avatar} alt={data.client} className="w-full h-full object-cover" />
               </div>
               <div className="absolute bottom-0 right-0 bg-emerald-500 text-white p-1.5 rounded-full border-4 border-white">
                  <CheckCircle2 size={16} strokeWidth={3} />
               </div>
           </div>

           <h3 className="text-xl font-bold text-gray-800 mb-1">{data.client}</h3>
           <p className="text-sm text-gray-500 mb-6">Cliente Fiel</p>

           {/* Package Summary Card */}
           <div className="w-full bg-purple-50 p-5 rounded-2xl border border-purple-100 mb-8 flex items-center gap-4">
              <div className="bg-white p-3 rounded-xl text-purple-600 shadow-sm">
                 <Layers size={24} />
              </div>
              <div className="flex-1">
                 <div className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-0.5">Pacote Finalizado</div>
                 <div className="font-bold text-gray-800 leading-tight">{data.service}</div>
                 <div className="text-xs font-bold text-gray-500 mt-1">{data.total} de {data.total} sessões</div>
              </div>
           </div>

           <div className="w-full space-y-3">
              <button 
                type="button"
                onClick={(e) => { e.preventDefault(); onEnd(); }}
                className="w-full py-4 rounded-xl bg-gray-100 text-gray-500 font-bold hover:bg-gray-200 hover:text-red-500 transition-colors flex items-center justify-center gap-3 group"
              >
                 <XCircle size={20} className="group-hover:text-red-500 transition-colors" />
                 <span>Encerrar</span>
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};