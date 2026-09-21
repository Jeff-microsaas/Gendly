import React, { useState, useEffect, useMemo } from 'react';
import { X, Calendar, Clock, CheckCircle2, MessageCircle, ArrowRight, User, AlertCircle, Trash2, SkipForward } from 'lucide-react';
import { QueueItem } from '../types';

interface QueueOpportunityModalProps {
  isOpen: boolean;
  onClose: () => void; // "Cancelar"
  slot: { date: string; time: string } | null;
  queue: QueueItem[];
  onConfirm: (item: QueueItem, slotDate: string, slotTime: string) => void; // "Confirmar"
}

export const QueueOpportunityModal: React.FC<QueueOpportunityModalProps> = ({ 
  isOpen, 
  onClose, 
  slot, 
  queue, 
  onConfirm 
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Reset index when modal opens
  useEffect(() => {
    if (isOpen) setCurrentIndex(0);
  }, [isOpen]);

  // Sort queue by time added (Oldest first = Longest wait)
  const sortedQueue = useMemo(() => {
    return [...queue].sort((a, b) => a.addedAt - b.addedAt);
  }, [queue]);

  if (!isOpen || !slot || sortedQueue.length === 0) return null;

  // Get current candidate based on index from SORTED list
  const candidate = sortedQueue[currentIndex] || sortedQueue[0];
  const isLast = currentIndex >= sortedQueue.length - 1;

  // Format Date for display
  const dateObj = new Date(slot.date + 'T12:00:00');
  const displayDate = dateObj.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' });
  const weekday = dateObj.toLocaleDateString('pt-BR', { weekday: 'long' });

  const handleNext = () => {
    if (!isLast) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handleWhatsApp = () => {
    // Ideally QueueItem should carry phone, but if not available, we open generic.
    const msg = `Olá *${candidate.clientName}*, surgiu uma vaga para *${candidate.serviceName}* no dia *${displayDate}* às *${slot.time}*. Tem interesse em confirmar?`;
    const url = `https://wa.me/?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col relative border border-purple-100">
        
        {/* Header Alert */}
        <div className="bg-emerald-500 p-6 text-white text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-6 -mt-6"></div>
            <div className="relative z-10">
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
                    <Clock size={14} /> Horário Liberado!
                </div>
                <h2 className="text-2xl font-bold">Oportunidade</h2>
                <p className="text-emerald-100 text-sm">Ofereça este horário para a fila.</p>
            </div>
        </div>

        {/* Slot Info */}
        <div className="bg-emerald-50 p-4 border-b border-emerald-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="bg-white p-2 rounded-xl text-emerald-600 shadow-sm">
                    <Calendar size={20} />
                </div>
                <div>
                    <div className="font-bold text-emerald-900 capitalize">{weekday}</div>
                    <div className="text-xs text-emerald-600 font-medium">{displayDate}</div>
                </div>
            </div>
            <div className="text-right">
                <div className="text-2xl font-black text-emerald-600">{slot.time}</div>
            </div>
        </div>

        {/* Candidate Card */}
        <div className="p-6">
            <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                    Próximo da Fila ({currentIndex + 1}/{sortedQueue.length})
                </span>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm relative group">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        {candidate.clientAvatar ? (
                            <img src={candidate.clientAvatar} alt={candidate.clientName} className="w-16 h-16 rounded-full object-cover border-4 border-gray-50 shadow-sm" />
                        ) : (
                            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 font-bold text-xl">
                                {candidate.clientName.charAt(0)}
                            </div>
                        )}
                        <div className="absolute -bottom-1 -right-1 bg-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white">
                            #{currentIndex + 1}
                        </div>
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-800 text-lg">{candidate.clientName}</h3>
                        <p className="text-sm text-gray-500 font-medium">{candidate.serviceName}</p>
                        <div className="flex items-center gap-1 mt-1 text-xs text-orange-500 font-bold">
                            <Clock size={12} />
                            <span>Aguardando</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Actions Grid */}
        <div className="p-6 bg-gray-50 border-t border-gray-100 grid grid-cols-2 gap-3">
            
            {/* 1. Conversar */}
            <button 
                onClick={handleWhatsApp}
                className="col-span-1 py-3 bg-white border border-gray-200 text-emerald-600 font-bold rounded-xl hover:bg-emerald-50 hover:border-emerald-200 transition-all flex items-center justify-center gap-2"
            >
                <MessageCircle size={18} />
                Conversar
            </button>

            {/* 2. Repassar */}
            <button 
                onClick={handleNext}
                disabled={isLast}
                className={`col-span-1 py-3 border font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
                    isLast 
                    ? 'bg-gray-100 text-gray-400 border-transparent cursor-not-allowed' 
                    : 'bg-white border-gray-200 text-gray-600 hover:bg-purple-50 hover:text-purple-600 hover:border-purple-200'
                }`}
            >
                <SkipForward size={18} />
                Repassar
            </button>

            {/* 3. Cancelar (Close Modal, Slot stays free) */}
            <button 
                onClick={onClose}
                className="col-span-1 py-3 bg-white border border-gray-200 text-gray-500 font-bold rounded-xl hover:bg-gray-100 hover:text-gray-700 transition-all flex items-center justify-center gap-2"
            >
                <X size={18} />
                Cancelar
            </button>

            {/* 4. Confirmar (Book immediately) */}
            <button 
                onClick={() => onConfirm(candidate, slot.date, slot.time)}
                className="col-span-1 py-3 bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-200 hover:bg-emerald-600 transition-all flex items-center justify-center gap-2"
            >
                <CheckCircle2 size={18} />
                Confirmar
            </button>

        </div>
      </div>
    </div>
  );
};