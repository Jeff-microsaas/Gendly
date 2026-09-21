
import React, { useMemo, useState, useEffect } from 'react';
import { Send, Trash2, MessageCircle, ShoppingBag, AlertCircle, Clock, CheckCircle2, Phone, QrCode, Copy, DollarSign, FileText, X, Receipt, Calendar, ChevronRight, Wallet, BadgeCheck, MoreHorizontal, Edit, ChevronDown, UserPlus, CalendarPlus, Layers, Check, Scissors, Sparkles, Play, ListOrdered, ArrowRight, ZoomIn, Gift, Crown, ShoppingCart, Package, Zap, PlusCircle, AlertTriangle, Lock, Settings } from 'lucide-react';
import { Product, Sale, Client, Installment, Appointment, QueueItem, LoyaltyRedemption, Category, PlanType, UserPermissions } from '../types';
import { QueueOpportunityModal } from './QueueOpportunityModal';

// --- HELPER FUNCTIONS (Pix & Formatting) ---

const crc16ccitt = (text: string) => {
    let crc = 0xFFFF;
    for (let i = 0; i < text.length; i++) {
        let c = text.charCodeAt(i);
        crc ^= (c << 8) & 0xFFFF;
        for (let j = 0; j < 8; j++) {
            if (crc & 0x8000) crc = ((crc << 1) ^ 0x1021) & 0xFFFF;
            else crc = (crc << 1) & 0xFFFF;
        }
    }
    return crc.toString(16).toUpperCase().padStart(4, '0');
};

const formatField = (id: string, value: string) => {
  const len = value.length.toString().padStart(2, '0');
  return `${id}${len}${value}`;
};

const normalizePixKey = (key: string) => {
  if (!key) return '';
  const clean = key.trim();
  
  if (clean.includes('@')) return clean.toLowerCase();
  
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(clean)) {
      return clean;
  }

  if (clean.startsWith('+')) return clean;

  const digits = clean.replace(/\D/g, '');

  if (digits.length === 14) {
      return digits;
  }

  if (digits.length === 11) {
      if (clean.includes('(') || digits[2] === '9') {
          return `+55${digits}`;
      }
      return digits;
  }

  if (digits.length === 12 && digits.startsWith('0') && digits[3] === '9') {
       return `+55${digits.substring(1)}`;
  }

  return digits;
};

const generatePixPayload = (key: string, amount: number) => {
  const cleanKey = normalizePixKey(key);
  const amountStr = amount.toFixed(2);
  const gui = formatField('00', 'br.gov.bcb.pix');
  const keyField = formatField('01', cleanKey);
  const merchantAccount = formatField('26', gui + keyField);
  
  let payload = formatField('00', '01') + merchantAccount + formatField('52', '0000') + formatField('53', '986') + formatField('54', amountStr) + formatField('58', 'BR') + formatField('59', 'GENDLY APP') + formatField('60', 'SAO PAULO') + formatField('62', formatField('05', '***')); 
  payload += '6304'; 
  const crc = crc16ccitt(payload);
  return payload + crc;
};

// --- MESSAGING HELPER ---
const sendBillingMessage = (data: any, pixKey: string) => {
    const { clientName, clientPhone, installment, totalInstallments, isOverdue, productNames } = data;

    if (!clientPhone) {
        console.warn("Cliente sem telefone cadastrado.");
        return;
    }
    
    let pixCode = '';
    if (pixKey) {
        pixCode = generatePixPayload(pixKey, installment.value);
    }

    const cleanPhone = clientPhone.replace(/\D/g, '');
    const finalPhone = cleanPhone.length <= 11 && !cleanPhone.startsWith('55') ? `55${cleanPhone}` : cleanPhone;
    
    const dateStr = new Date(installment.dueDate + 'T12:00:00').toLocaleDateString('pt-BR');
    const valueStr = installment.value.toFixed(2).replace('.', ',');

    let message = `Olá *${clientName}*, tudo bem?\n\n`;
    message += `Consta em aberto a parcela *${installment.number}/${totalInstallments}* referente a compra de: _${productNames}_.\n\n`;
    message += `💰 Valor: *R$ ${valueStr}*\n`;
    message += `📅 Vencimento: *${dateStr}*\n`;
    
    if (isOverdue) {
      message += `⚠️ *Status: Pendente/Em Atraso*\n`;
    }

    if (pixCode) {
       message += `\nSegue código Pix para pagamento (Copia e Cola):\n\n${pixCode}\n\n`;
       message += `✅ Após envio do comprovante o débito será baixado no sistema.`;
    } else {
       message += `\nApós envio do comprovante o débito será baixado no sistema.`;
    }

    const url = `https://wa.me/${finalPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
};


// --- COMPONENTS ---

const UpgradeModal: React.FC<{ isOpen: boolean; onClose: () => void; onUpgrade: () => void }> = ({ isOpen, onClose, onUpgrade }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-sm p-8 text-center animate-in zoom-in-95 duration-200 border border-purple-100">
                <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Lock size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Funcionalidade Bloqueada</h3>
                <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                    O módulo de <b>Loja e Venda de Produtos</b> está disponível apenas no <b>Plano Profissional</b> ou superior. Deseja alterar seu plano agora?
                </p>
                <div className="space-y-3">
                    <button 
                        onClick={onUpgrade}
                        className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-black shadow-lg shadow-purple-100 hover:scale-[1.02] active:scale-[0.98] transition-all uppercase tracking-widest text-xs"
                    >
                        VER PLANOS E UPGRADE
                    </button>
                    <button 
                        onClick={onClose}
                        className="w-full py-3 text-gray-400 font-bold text-xs hover:text-gray-600 transition-colors"
                    >
                        Recusar e Continuar Navegação
                    </button>
                </div>
            </div>
        </div>
    );
};

const EnableFeatureModal: React.FC<{ isOpen: boolean; onClose: () => void; onGoToSettings: () => void }> = ({ isOpen, onClose, onGoToSettings }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-sm p-8 text-center animate-in zoom-in-95 duration-200 border border-blue-100">
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Settings size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Funcionalidade Inativa</h3>
                <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                    Habilite a opção Loja na pagina "Ajustes" para começar a vender produtos.
                </p>
                <div className="space-y-3">
                    <button 
                        onClick={onGoToSettings}
                        className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black shadow-lg shadow-blue-100 hover:scale-[1.02] active:scale-[0.98] transition-all uppercase tracking-widest text-xs"
                    >
                        Ir para Ajustes
                    </button>
                    <button 
                        onClick={onClose}
                        className="w-full py-3 text-gray-400 font-bold text-xs hover:text-gray-600 transition-colors"
                    >
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    );
};

const ImageViewerModal: React.FC<{ src: string | null; onClose: () => void }> = ({ src, onClose }) => {
    if (!src) return null;
    return (
        <div className="fixed inset-0 z-150 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={onClose}>
            <button onClick={onClose} className="absolute top-4 right-4 text-white hover:text-gray-300 p-2">
                <X size={32} />
            </button>
            <div className="relative max-w-full max-h-full" onClick={(e) => e.stopPropagation()}>
                <img src={src} alt="Zoom" className="max-w-full max-h-[85vh] rounded-xl shadow-2xl object-contain" />
            </div>
        </div>
    );
};

const SuccessOverlay: React.FC<{ message?: string }> = ({ message = "Confirmado!" }) => (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 backdrop-blur-sm p-6 animate-in fade-in duration-300">
        <div className="bg-white rounded-3xl p-8 flex flex-col items-center shadow-2xl animate-in zoom-in duration-300">
            <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-emerald-100">
                <CheckCircle2 size={56} className="text-emerald-500 animate-bounce" strokeWidth={3} />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">{message}</h2>
            <div className="flex items-center gap-2 text-emerald-600 font-bold bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100 mt-2">
                <Sparkles size={16} />
                <span>Processando...</span>
            </div>
        </div>
    </div>
);

interface ReplenishModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (amount: number) => void;
    productName: string;
}

const ReplenishModal: React.FC<ReplenishModalProps> = ({ isOpen, onClose, onConfirm, productName }) => {
    const [amount, setAmount] = useState<string>('10');
    if (!isOpen) return null;

    const handleConfirm = () => {
        const val = parseFloat(amount);
        if (!isNaN(val) && val > 0) {
            onConfirm(val);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-[2rem] shadow-2xl w-full max-sm p-8 animate-in zoom-in duration-200">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <PlusCircle size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-800 text-center mb-2">Reposição de Estoque</h3>
                <p className="text-gray-500 text-sm text-center mb-6">
                    Informe a quantidade que está entrando no estoque para <b>{productName}</b>.
                </p>
                <div className="space-y-4">
                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Quantidade Recebida</label>
                        <input 
                            type="number" 
                            autoFocus
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-emerald-200 outline-none font-bold text-center text-xl text-emerald-600"
                        />
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button 
                            onClick={onClose}
                            className="flex-1 py-4 bg-gray-100 text-gray-600 font-bold rounded-2xl hover:bg-gray-200 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button 
                            onClick={handleConfirm}
                            className="flex-1 py-4 bg-emerald-500 text-white font-bold rounded-2xl shadow-lg shadow-emerald-200 hover:bg-emerald-600 transition-all active:scale-95"
                        >
                            Confirmar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

interface RescheduleModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (date: string, time: string) => void;
    currentData: { date: string, time: string };
    appointments: Appointment[];
    ignoreId: number | null;
    settings: {
        openingTime: string;
        closingTime: string;
        interval: number;
    };
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

const RescheduleModal: React.FC<RescheduleModalProps> = ({ isOpen, onClose, onSave, currentData, appointments, ignoreId, settings }) => {
    const [date, setDate] = useState(currentData.date);
    const [time, setTime] = useState(currentData.time);

    const timeSlots = useMemo(() => {
        return generateSlots(settings.openingTime, settings.closingTime, settings.interval);
    }, [settings]);

    useEffect(() => {
        if (isOpen) {
            setDate(currentData.date);
            setTime(currentData.time);
        }
    }, [isOpen, currentData]);

    const busyTimes = useMemo(() => {
        return appointments
            .filter(apt => 
                apt.rawDate === date && 
                apt.id !== ignoreId && 
                apt.status !== 'Cancelado' 
            )
            .map(apt => apt.time);
    }, [date, appointments, ignoreId]);

    const getLocalDate = (offsetDays = 0) => {
        const d = new Date();
        d.setDate(d.getDate() + offsetDays);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const availableSlots = useMemo(() => {
        if (!date) return [];
        
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const todayStr = `${year}-${month}-${day}`;

        const isToday = date === todayStr;
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();

        return timeSlots.filter(slot => {
            if (busyTimes.includes(slot)) return false;
            if (isToday) {
                const [h, m] = slot.split(':').map(Number);
                if (h < currentHour) return false;
                if (h === currentHour && m < currentMinute) return false;
            }
            return true;
        });
    }, [busyTimes, date, timeSlots]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-in zoom-in duration-200">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-gray-800">Remarcar Atendimento</h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 text-gray-400"><X size={20} /></button>
                </div>
                <div className="space-y-6">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Nova Data</label>
                        <div className="relative">
                             <input 
                                type="date" 
                                value={date}
                                onChange={(e) => {
                                    setDate(e.target.value);
                                    setTime(''); 
                                }}
                                onClick={(e) => {
                                    try {
                                        if (e.currentTarget && typeof e.currentTarget.showPicker === 'function') {
                                            e.currentTarget.showPicker();
                                        }
                                    } catch (err) {}
                                }}
                                min={getLocalDate(0)}
                                className="w-full p-3 pl-10 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-200 outline-none cursor-pointer font-bold text-gray-700"
                            />
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Horários Disponíveis</label>
                        {!date ? (
                            <div className="text-center py-4 text-gray-400 text-sm bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                Selecione uma data primeiro.
                            </div>
                        ) : availableSlots.length > 0 ? (
                            <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
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
                                Agenda cheia ou horário expirado.
                            </div>
                        )}
                    </div>
                    <button 
                        onClick={() => onSave(date, time)}
                        disabled={!date || !time}
                        className={`w-full py-3.5 font-bold rounded-xl transition-colors shadow-lg flex items-center justify-center gap-2 ${
                            !date || !time
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
                                : 'bg-purple-600 text-white hover:bg-purple-700 shadow-purple-200'
                        }`}
                    >
                        <CheckCircle2 size={18} />
                        Confirmar Remarcação
                    </button>
                </div>
            </div>
        </div>
    );
};

interface CancelConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const CancelConfirmationModal: React.FC<CancelConfirmationModalProps> = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-500 flex items-center justify-center mb-4 mx-auto">
                <Trash2 size={24} />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Cancelar Agendamento?</h3>
            <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                Tem certeza que deseja excluir este agendamento? O horário ficará disponível para novos clientes.
            </p>
            <div className="flex gap-3">
                <button 
                    onClick={onClose} 
                    className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-600 font-bold text-sm hover:bg-gray-200 transition-colors"
                >
                    Não, Manter
                </button>
                <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        onConfirm();
                    }} 
                    className="flex-1 py-3 rounded-xl bg-red-500 text-white font-bold text-sm hover:bg-red-600 transition-colors shadow-lg shadow-red-200"
                >
                    Sim, Excluir
                </button>
            </div>
        </div>
    </div>
  );
};

interface PaymentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any; 
  pixKey: string;
  onConfirmPayment: (saleId: string, installmentNumber: number) => void;
}

const PaymentDetailModal: React.FC<PaymentDetailModalProps> = ({ isOpen, onClose, data, pixKey, onConfirmPayment }) => {
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
        setShowSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen || !data) return null;

  const { sale, installment, clientName, clientPhone, isOverdue, totalInstallments, productNames } = data;
  
  const totalPaid = sale.installments
    .filter((i: Installment) => i.status === 'PAID')
    .reduce((acc: number, curr: Installment) => acc + curr.value, 0);
  
  const totalPending = sale.total - totalPaid;

  const handlePay = () => {
    setShowSuccess(true);
    setTimeout(() => {
        onConfirmPayment(data.saleId, installment.number);
        onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] relative">
        {showSuccess && (
           <div className="absolute inset-0 z-[100] bg-white/90 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300">
              <div className="text-center">
                 <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-100">
                    <CheckCircle2 size={56} className="text-emerald-500 animate-bounce" strokeWidth={3} />
                 </div>
                 <h2 className="text-3xl font-bold text-gray-800 mb-2">Pagamento Confirmado!</h2>
                 <p className="text-gray-500 font-medium">Parcela baixada com sucesso.</p>
                 <div className="mt-8 flex justify-center">
                    <div className="flex items-center gap-2 text-emerald-600 font-bold bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100">
                        <Sparkles size={16} />
                        <span>Processando...</span>
                    </div>
                 </div>
              </div>
           </div>
        )}
        <div className="bg-gray-50 p-6 border-b border-gray-100 flex justify-between items-start shrink-0">
           <div className="flex gap-4">
              <div className="relative">
                  {data.clientAvatar ? (
                    <img src={data.clientAvatar} className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm" alt={clientName} />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-lilac-100 text-lilac-600 flex items-center justify-center font-bold text-xl">
                       {clientName.charAt(0)}
                    </div>
                  )}
                  {isOverdue && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-red-500 border-2 border-white rounded-full flex items-center justify-center">
                      <AlertCircle size={12} className="text-white" />
                    </div>
                  )}
              </div>
              <div>
                 <h3 className="text-xl font-bold text-gray-800">{clientName}</h3>
                 <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Phone size={14} />
                    <span>{clientPhone || 'Sem telefone'}</span>
                 </div>
              </div>
           </div>
           <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-400">
             <X size={24} />
           </button>
        </div>
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
           <div className={`p-4 rounded-2xl border flex items-center gap-4 ${isOverdue ? 'bg-red-50 border-red-100' : 'bg-blue-50 border-blue-100'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isOverdue ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                 {isOverdue ? <AlertCircle size={20} /> : <Calendar size={20} />}
              </div>
              <div>
                 <div className={`text-xs font-bold uppercase tracking-wider ${isOverdue ? 'text-red-600' : 'text-blue-600'}`}>
                    {isOverdue ? 'Atraso de Pagamento' : 'Próximo Vencimento'}
                 </div>
                 <div className="text-sm font-medium text-gray-700">
                    Parcela {installment.number} de {totalInstallments} • Vence: {new Date(installment.dueDate + 'T12:00:00').toLocaleDateString('pt-BR')}
                 </div>
              </div>
           </div>
           <div>
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                 <ShoppingBag size={14} /> Detalhes da Compra
              </h4>
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                 <div className="text-sm text-gray-800 font-medium mb-1 line-clamp-2">
                    {productNames}
                 </div>
                 <div className="text-xs text-gray-500">
                    Realizada em: {new Date(sale.date + 'T12:00:00').toLocaleDateString('pt-BR')}
                 </div>
              </div>
           </div>
            <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Receipt size={14} /> Histórico de Parcelas
                </h4>
                <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
                    {sale.installments.sort((a: any, b: any) => a.number - b.number).map((inst: Installment) => (
                        <div key={inst.number} className="flex items-center justify-between p-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                    inst.status === 'PAID' 
                                    ? 'bg-emerald-100 text-emerald-600' 
                                    : (new Date(inst.dueDate) < new Date() ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500')
                                }`}>
                                    {inst.number}
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-gray-700">
                                        {new Date(inst.dueDate + 'T12:00:00').toLocaleDateString('pt-BR')}
                                    </div>
                                    <div className="text-[10px] text-gray-400 font-medium">
                                        R$ {inst.value.toFixed(2).replace('.', ',')}
                                    </div>
                                </div>
                            </div>
                            <div className={`text-[10px] font-bold uppercase px-2 py-1 rounded ${
                                inst.status === 'PAID' 
                                ? 'bg-emerald-50 text-emerald-700' 
                                : 'bg-gray-50 text-gray-400'
                            }`}>
                                {inst.status === 'PAID' ? 'Pago' : 'Aberto'}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
           <div>
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                 <DollarSign size={14} /> Resumo Financeiro
              </h4>
              <div className="space-y-3">
                 <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Valor Total da Compra</span>
                    <span className="text-sm font-bold text-gray-800">R$ {sale.total.toFixed(2).replace('.', ',')}</span>
                 </div>
                 <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Já Pago</span>
                    <span className="text-sm font-bold text-emerald-600">R$ {totalPaid.toFixed(2).replace('.', ',')}</span>
                 </div>
                 <div className="w-full h-px bg-gray-100"></div>
                 <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Restante a Pagar</span>
                    <span className="text-base font-bold text-gray-800">R$ {totalPending.toFixed(2).replace('.', ',')}</span>
                 </div>
              </div>
           </div>
        </div>
        <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex gap-3 shrink-0">
           <button 
             type="button"
             onClick={() => sendBillingMessage(data, pixKey)}
             className="flex-1 py-3.5 rounded-xl font-bold text-white flex items-center justify-center gap-2 shadow-lg transition-all transform active:scale-95 bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200"
           >
             <MessageCircle size={20} />
             <span>COBRAR</span>
           </button>
           <button 
             type="button"
             onClick={handlePay}
             className="flex-1 py-3.5 rounded-xl font-bold text-white flex items-center justify-center gap-2 shadow-lg transform active:scale-95 bg-blue-500 hover:bg-blue-600 shadow-blue-200"
           >
             <BadgeCheck size={20} />
             <span>PAGO</span>
           </button>
        </div>
      </div>
    </div>
  );
};


interface DashboardHomeProps {
  products: Product[];
  categories: Category[];
  onNewSale: () => void;
  sales: Sale[];
  clients: Client[];
  appointments: Appointment[];
  pixKey: string;
  onConfirmPayment: (saleId: string, installmentNumber: number) => void;
  onNewClient: () => void;
  onNewAppointment: () => void;
  onUpdateAppointments: (appointments: Appointment[]) => void;
  onConfirmAppointment: (id: number) => void;
  onStartAppointment: (id: number) => void;
  onFinishSession: (packageId: number) => void;
  onViewClientHistory: (client: Client) => void; 
  activePackages: any[];
  queue: QueueItem[];
  onOpenQueue: () => void;
  onRemoveFromQueue: (id: string) => void;
  onPromoteQueueToAppointment: (item: QueueItem, targetSlot?: { date: string, time: string }) => void;
  getPackageInfo: (apt: Appointment) => { current: number, total: number } | null;
  pendingRedemptions: LoyaltyRedemption[];
  onConfirmRedemption: (redemption: LoyaltyRedemption) => void;
  loyaltyEnabled: boolean;
  stockEnabled: boolean;
  stockWhatsApp?: string;
  onSendStockReport?: () => void;
  onReplenishStock?: (productId: string, amount: number) => void; 
  reportedProductIds?: string[];
  storeEnabled?: boolean; 
  isAutoReportDay?: boolean; 
  onUpgradePlan?: () => void; 
  plan: PlanType;
  settings: {
      openingTime: string;
      closingTime: string;
      interval: number;
  };
  userPermissions: UserPermissions;
}

export const DashboardHome: React.FC<DashboardHomeProps> = ({ 
    products, 
    categories,
    onNewSale, 
    sales, 
    clients, 
    appointments, 
    pixKey, 
    onConfirmPayment, 
    onNewClient, 
    onNewAppointment, 
    onUpdateAppointments, 
    onConfirmAppointment, 
    onStartAppointment, 
    onFinishSession, 
    onViewClientHistory, 
    activePackages,
    queue,
    onOpenQueue,
    onRemoveFromQueue,
    onPromoteQueueToAppointment,
    getPackageInfo,
    pendingRedemptions,
    onConfirmRedemption,
    loyaltyEnabled,
    stockEnabled,
    stockWhatsApp,
    onSendStockReport,
    onReplenishStock,
    reportedProductIds = [],
    storeEnabled = true,
    isAutoReportDay = false,
    onUpgradePlan,
    plan,
    settings,
    userPermissions
}) => {
  
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [isPendingExpanded, setIsPendingExpanded] = useState(false);
  const [isPackagesExpanded, setIsPackagesExpanded] = useState(false);
  const [isQueueExpanded, setIsQueueExpanded] = useState(false);
  const [isLoyaltyExpanded, setIsLoyaltyExpanded] = useState(false);
  const [isShoppingExpanded, setIsShoppingExpanded] = useState(false);
  const [viewingImage, setViewingImage] = useState<string | null>(null);
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);
  const [rescheduleTargetId, setRescheduleTargetId] = useState<number | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [opportunitySlot, setOpportunitySlot] = useState<{ date: string, time: string } | null>(null);
  const [replenishTarget, setReplenishTarget] = useState<Product | null>(null);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [isEnableFeatureModalOpen, setIsEnableFeatureModalOpen] = useState(false);

  const visibleAppointments = useMemo(() => {
    return appointments.filter(apt => 
        apt.status !== 'Em Andamento' && 
        apt.status !== 'Finalizado'
    );
  }, [appointments]);
  
  const isSlotInFuture = (dateStr: string, timeStr: string) => {
     if (!dateStr || !timeStr) return false;
     const [year, month, day] = dateStr.split('-').map(Number);
     const [hour, minute] = timeStr.split(':').map(Number);
     const slotDate = new Date(year, month - 1, day, hour, minute, 0);
     const now = new Date();
     return slotDate.getTime() > now.getTime();
  };

  const pendingInstallments = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return sales
      .filter(sale => sale.installments.some(inst => inst.status === 'PENDING' || inst.status === 'OVERDUE'))
      .map(sale => {
        const client = clients.find(c => c.id === sale.clientId);
        const relevantInstallment = sale.installments
            .filter(i => i.status === 'PENDING' || i.status === 'OVERDUE')
            .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0];
        if (!relevantInstallment) return null;
        const isOverdue = relevantInstallment.dueDate < today;
        const productNames = sale.items.map((item: any) => {
            const p = products.find(prod => prod.id === item.productId);
            return p ? p.name : 'Produto';
        }).join(', ');
        return {
          sale: sale, 
          saleId: sale.id,
          clientId: sale.clientId,
          clientName: client?.name || 'Cliente Desconhecido',
          clientAvatar: client?.avatar,
          clientPhone: client?.whatsapp,
          installment: relevantInstallment,
          totalInstallments: sale.installments.length,
          isOverdue,
          productNames
        };
      })
      .filter(item => item !== null) 
      .sort((a, b) => {
         if (a!.isOverdue && !b!.isOverdue) return -1;
         if (!a!.isOverdue && b!.isOverdue) return 1;
         return new Date(a!.installment.dueDate).getTime() - new Date(b!.installment.dueDate).getTime();
      });
  }, [sales, clients, products]);

  const lowStockItems = useMemo(() => {
    return products.filter(p => p.type === 'PRODUCT' && p.quantity <= (p.minQuantity || 5));
  }, [products]);

  const handleQuickPay = (saleId: string, installmentNumber: number) => {
      setShowPaymentSuccess(true);
      setTimeout(() => {
          onConfirmPayment(saleId, installmentNumber);
          setShowPaymentSuccess(false);
      }, 2000);
  };

  const handleDeleteAppointment = (id: number, e?: React.MouseEvent) => {
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }
    setDeleteTargetId(id);
  };

  const handleConfirmDelete = () => {
    if (deleteTargetId) {
        const aptToDelete = appointments.find(a => a.id === deleteTargetId);
        const updated = appointments.filter(apt => apt.id !== deleteTargetId);
        onUpdateAppointments(updated);
        setDeleteTargetId(null);
        if (aptToDelete && queue.length > 0 && isSlotInFuture(aptToDelete.rawDate, aptToDelete.time)) {
            setOpportunitySlot({ date: aptToDelete.rawDate, time: aptToDelete.time });
        }
    }
  };

  const handleRemindAppointment = (apt: Appointment) => {
    const client = clients.find(c => c.name.toLowerCase() === apt.client.toLowerCase() || c.nickname?.toLowerCase() === apt.client.toLowerCase());
    const phone = client?.whatsapp || '';
    const cleanPhone = phone.replace(/\D/g, '');
    const finalPhone = cleanPhone.length <= 11 && !cleanPhone.startsWith('55') && cleanPhone.length > 1 ? `55${cleanPhone}` : cleanPhone;
    const msg = `Olá ${apt.clientNickname || apt.client}, confirmamos seu horário para *${apt.service}* dia *${apt.date}* às *${apt.time}* com ${apt.professional}. Tudo certo?`;
    if (finalPhone) {
       window.open(`https://wa.me/${finalPhone}?text=${encodeURIComponent(msg)}`, '_blank');
    } else {
       window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
    }
  };

  const handleOpenReschedule = (id: number) => {
    setRescheduleTargetId(id);
  };

  const handleSaveReschedule = (newDate: string, newTime: string) => {
    if (!rescheduleTargetId) return;
    const oldApt = appointments.find(a => a.id === rescheduleTargetId);
    if (oldApt && queue.length > 0 && isSlotInFuture(oldApt.rawDate, oldApt.time)) {
        setOpportunitySlot({ date: oldApt.rawDate, time: oldApt.time });
    }
    const updated = appointments.map(apt => {
        if (apt.id === rescheduleTargetId) {
            const dateObj = new Date(newDate + 'T12:00:00');
            const displayDate = dateObj.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' }).replace('.', '');
            const weekday = dateObj.toLocaleDateString('pt-BR', { weekday: 'long' }).split('-')[0].toUpperCase();
            return {
                ...apt,
                rawDate: newDate,
                date: displayDate,
                weekday: weekday,
                time: newTime,
                status: 'Agendado' 
            };
        }
        return apt;
    });
    updated.sort((a, b) => {
        const dateA = new Date(`${a.rawDate}T${a.time}`);
        const dateB = new Date(`${b.rawDate}T${b.time}`);
        return dateA.getTime() - dateB.getTime();
    });
    onUpdateAppointments(updated);
    setRescheduleTargetId(null);
  };

  const rescheduleData = useMemo(() => {
      if (!rescheduleTargetId) return { date: '', time: '' };
      const target = appointments.find(a => a.id === rescheduleTargetId);
      return target ? { date: target.rawDate, time: target.time } : { date: '', time: '' };
  }, [rescheduleTargetId, appointments]);

  const getQueueTime = (addedAt: number) => {
      const diff = Date.now() - addedAt;
      const mins = Math.floor(diff / 60000);
      if (mins < 60) return `${mins} min`;
      const hours = Math.floor(mins / 60);
      return `${hours}h ${mins % 60}m`;
  };

  const handleConfirmOpportunity = (item: QueueItem, date: string, time: string) => {
      onPromoteQueueToAppointment(item, { date, time });
      setOpportunitySlot(null); 
  };

  const handleConfirmReplenish = (amount: number) => {
      if (replenishTarget) {
          onReplenishStock?.(replenishTarget.id, amount);
          setReplenishTarget(null);
      }
  };

  const handleUpgradeNavigation = () => {
      setIsUpgradeModalOpen(false);
      onUpgradePlan?.();
  };

  const handleVenderClick = () => {
    if (plan === 'ESSENTIAL') {
        setIsUpgradeModalOpen(true);
        return;
    }
    
    if (!userPermissions.store) {
        return;
    }

    if (!storeEnabled) {
        setIsEnableFeatureModalOpen(true);
        return;
    }

    onNewSale();
  };

  return (
    <div className="space-y-8 pb-10 relative">
      <ImageViewerModal src={viewingImage} onClose={() => setViewingImage(null)} />
      {showPaymentSuccess && <SuccessOverlay message="Pagamento Confirmado!" />}
      <ReplenishModal 
        isOpen={!!replenishTarget} 
        onClose={() => setReplenishTarget(null)} 
        onConfirm={handleConfirmReplenish} 
        productName={replenishTarget?.name || ''} 
      />
      <UpgradeModal 
        isOpen={isUpgradeModalOpen} 
        onClose={() => setIsUpgradeModalOpen(false)} 
        onUpgrade={handleUpgradeNavigation} 
      />
      <EnableFeatureModal 
        isOpen={isEnableFeatureModalOpen} 
        onClose={() => setIsEnableFeatureModalOpen(false)} 
        onGoToSettings={onUpgradePlan || (() => {})} 
      />

      <RescheduleModal 
        isOpen={!!rescheduleTargetId} 
        onClose={() => setRescheduleTargetId(null)} 
        onSave={handleSaveReschedule} 
        currentData={rescheduleData} 
        appointments={appointments} 
        ignoreId={rescheduleTargetId}
        settings={settings}
      />
      <CancelConfirmationModal isOpen={!!deleteTargetId} onClose={() => setDeleteTargetId(null)} onConfirm={handleConfirmDelete} />
      <PaymentDetailModal isOpen={!!selectedPayment} onClose={() => setSelectedPayment(null)} data={selectedPayment} pixKey={pixKey} onConfirmPayment={onConfirmPayment} />
      <QueueOpportunityModal isOpen={!!opportunitySlot} onClose={() => setOpportunitySlot(null)} slot={opportunitySlot} queue={queue} onConfirm={handleConfirmOpportunity} />

      <div className="w-full banner-gradient rounded-2xl p-6 text-white shadow-md shadow-pink-100 relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-xl md:text-2xl font-bold mb-1 tracking-tight">Próximos Atendimentos</h2>
          <p className="text-white/90 text-sm font-medium">Estes são seus próximos compromissos.</p>
        </div>
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/5 rounded-full blur-2xl -ml-8 -mb-8"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {visibleAppointments.map((apt) => {
          const isConfirmed = apt.status === 'Confirmado';
          const displayName = apt.clientNickname || apt.client;
          const isPackage = apt.category && apt.category.toUpperCase().includes('PACOTE');
          const packageInfo = isPackage ? getPackageInfo(apt) : null;
          const isReward = apt.isReward;
          return (
            <div key={apt.id} className={`bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all relative overflow-hidden flex flex-col p-3 gap-2.5 ${isReward ? 'ring-2 ring-yellow-200' : ''}`}>
               <div className={`absolute top-0 left-0 w-1 h-full ${isReward ? 'bg-yellow-400' : (isConfirmed ? 'bg-emerald-400' : 'bg-purple-400')}`}></div>
               <div className="pl-3 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                     <span className="text-xl font-black text-gray-800 tracking-tight poppins leading-none">{apt.time}</span>
                     <div className="h-6 w-px bg-gray-200 mx-1"></div>
                     <div className="flex flex-col leading-none">
                        <span className="text-[9px] font-black text-purple-600 uppercase tracking-wider">{apt.weekday}</span>
                        <span className="text-[10px] font-bold text-gray-400">{apt.date}</span>
                     </div>
                  </div>
                  {isReward ? (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-yellow-100 text-yellow-700 flex items-center gap-1">
                          <Crown size={10} /> PRÊMIO
                      </span>
                  ) : (
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${isConfirmed ? 'bg-emerald-50 text-emerald-600' : 'bg-purple-50 text-purple-600'}`}>
                         {apt.status}
                      </span>
                  )}
               </div>
               <div className={`pl-3 bg-gray-50 rounded-lg p-3 border border-gray-100/50 ${isReward ? 'bg-yellow-50/30' : ''}`}>
                  <div className="flex justify-between items-start mb-2">
                     <div className="flex items-center gap-2">
                        <div 
                            className="relative group cursor-pointer"
                            onClick={(e) => { e.stopPropagation(); setViewingImage(apt.avatar); }}
                        >
                            <img src={apt.avatar} alt={apt.client} className="w-9 h-9 rounded-full border border-white shadow-sm object-cover group-hover:scale-110 transition-transform" />
                            {isConfirmed && <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border border-white rounded-full"></div>}
                            <div className="absolute inset-0 bg-black/10 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                <ZoomIn size={12} className="text-white" />
                            </div>
                        </div>
                        <div className="min-w-0">
                            <div className="font-bold text-gray-800 text-sm truncate leading-tight">{displayName}</div>
                            <button 
                                onClick={() => {
                                    const client = clients.find(c => c.name === apt.client || c.nickname === apt.client);
                                    if (client) onViewClientHistory(client);
                                }}
                                className="text-[9px] text-purple-500 font-bold cursor-pointer hover:underline text-left"
                            >
                                Ver Ficha
                            </button>
                        </div>
                     </div>
                  </div>
                  <div className="border-t border-gray-200 pt-2 mt-1">
                     <div className="flex items-center gap-1.5 mb-1">
                         <div className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wide ${
                              isReward ? 'bg-yellow-100 text-yellow-700' : (isPackage ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-600')
                         }`}>
                             {isReward ? <Gift size={10} /> : (isPackage ? <Layers size={10} /> : <Scissors size={10} />)}
                             {isReward ? 'Recompensa' : (isPackage ? 'Pacote' : 'Serviço')}
                         </div>
                         <div className="flex items-center gap-1">
                            <span className="text-[9px] text-gray-400 font-bold">com</span>
                            <img src={apt.professionalAvatar} alt={apt.professional} className="w-3.5 h-3.5 rounded-full object-cover" />
                            <span className="text-[9px] font-bold text-gray-600">{apt.professional}</span>
                         </div>
                     </div>
                     <h3 className="font-bold text-gray-800 text-xs truncate leading-snug">{apt.service}</h3>
                     {isPackage && packageInfo && (
                        <div className="mt-1.5 flex items-center justify-between bg-white rounded-md px-2 py-1 border border-gray-100">
                           <span className="text-[9px] font-bold text-gray-500">Sessão {packageInfo.current}/{packageInfo.total}</span>
                           <span className="text-[9px] font-bold text-purple-500 uppercase">Faltam {packageInfo.total - packageInfo.current}</span>
                        </div>
                     )}
                  </div>
               </div>
               <div className="pl-3 grid grid-cols-6 gap-1.5">
                    {!isConfirmed && (
                       <button 
                         type="button"
                         onClick={() => onConfirmAppointment(apt.id)}
                         className="col-span-3 py-1.5 rounded bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-wide hover:bg-emerald-600 hover:shadow-lg hover:shadow-emerald-200 transition-all active:scale-[0.98] flex items-center justify-center gap-1"
                       >
                         <CheckCircle2 size={12} /> Confirmar
                       </button>
                    )}
                    <button 
                        type="button"
                        onClick={() => handleRemindAppointment(apt)}
                        className={`${!isConfirmed ? 'col-span-3' : 'col-span-3'} py-1.5 rounded bg-cyan-50 text-cyan-700 text-[10px] font-bold uppercase tracking-wide hover:bg-cyan-100 transition-colors border border-cyan-100 flex items-center justify-center gap-1`}
                    >
                        Lembrar
                    </button>
                    <button 
                        type="button"
                        onClick={() => handleOpenReschedule(apt.id)}
                        className={`${!isConfirmed ? 'col-span-5' : 'col-span-2'} py-1.5 rounded bg-gray-50 text-gray-600 text-[10px] font-bold uppercase tracking-wide hover:bg-purple-50 hover:text-purple-600 transition-colors border border-gray-100 flex items-center justify-center`}
                        title="Remarcar"
                    >
                        Remarcar
                    </button>
                     <button 
                        type="button"
                        onClick={(e) => handleDeleteAppointment(apt.id, e)}
                        className="col-span-1 py-1.5 rounded bg-rose-50 text-rose-600 text-[10px] font-bold uppercase tracking-wide hover:bg-rose-100 transition-colors border border-rose-100 flex items-center justify-center"
                        title="Cancelar"
                    >
                        <Trash2 size={12} />
                    </button>
               </div>
            </div>
          );
        })}
        {visibleAppointments.length === 0 && (
            <div className="col-span-full text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200 text-gray-400">
                <Calendar size={48} className="mx-auto mb-2 opacity-20" />
                <p>Nenhum agendamento próximo.</p>
            </div>
        )}
      </div>

      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">
        <h3 className="text-xl font-bold text-gray-800 mb-6">Acesso Rápido</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
           <button onClick={onNewAppointment} className="flex flex-col items-center justify-center p-4 rounded-2xl bg-blue-50 hover:bg-blue-100 border border-blue-100 transition-all group relative overflow-hidden h-32 md:h-auto shadow-sm">
              <div className="w-12 h-12 rounded-full bg-white shadow-sm text-blue-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                 <CalendarPlus size={24} strokeWidth={2.5} />
              </div>
              <span className="text-xs md:text-sm font-bold text-blue-700 text-center leading-tight">Novo<br/>Agendamento</span>
           </button>
           <button onClick={onNewClient} className="flex flex-col items-center justify-center p-4 rounded-2xl bg-purple-50 hover:bg-purple-100 border border-purple-100 transition-all group relative overflow-hidden h-32 md:h-auto shadow-sm">
              <div className="w-12 h-12 rounded-full bg-white shadow-sm text-purple-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                 <UserPlus size={24} strokeWidth={2.5} />
              </div>
              <span className="text-xs md:text-sm font-bold text-purple-700 text-center leading-tight">Novo<br/>Cliente</span>
           </button>
           <button onClick={onOpenQueue} className="flex flex-col items-center justify-center p-4 rounded-2xl bg-orange-50 hover:bg-orange-100 border border-orange-100 transition-all group relative overflow-hidden h-32 md:h-auto shadow-sm">
              <div className="w-12 h-12 rounded-full bg-white shadow-sm text-orange-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                 <ListOrdered size={24} strokeWidth={2.5} />
              </div>
              <span className="text-xs md:text-sm font-bold text-orange-700 text-center leading-tight">Colocar na<br/>Fila</span>
           </button>
           <button 
              onClick={handleVenderClick} 
              className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all group relative overflow-hidden h-32 md:h-auto shadow-sm ${
                (userPermissions.store) ? 'bg-emerald-50 hover:bg-emerald-100 border-emerald-100' : 'bg-gray-50 border-gray-100 opacity-60'
              }`}
           >
              <div className={`w-12 h-12 rounded-full shadow-sm flex items-center justify-center mb-3 transition-transform bg-white ${
                (userPermissions.store) ? 'text-emerald-600 group-hover:scale-110' : 'text-gray-400'
              }`}>
                 {(userPermissions.store) ? <ShoppingBag size={24} strokeWidth={2.5} /> : <Lock size={20} />}
              </div>
              <span className={`text-xs md:text-sm font-bold text-center leading-tight ${userPermissions.store ? 'text-emerald-700' : 'text-gray-500'}`}>
                Vender<br/>Produtos
              </span>
              {plan === 'ESSENTIAL' && <div className="absolute top-2 right-2 bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter">Pro</div>}
              {plan !== 'ESSENTIAL' && !userPermissions.store && <div className="absolute top-2 right-2 bg-red-100 text-red-600 px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter">Bloq</div>}
           </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden transition-all">
          <button 
             onClick={() => setIsPackagesExpanded(!isPackagesExpanded)}
             className="w-full flex items-center justify-between p-6 md:p-8 bg-white hover:bg-gray-50/80 transition-colors cursor-pointer text-left outline-none group"
          >
            <div className="flex items-center gap-3">
               <div className="bg-blue-100 p-2 rounded-xl text-blue-500 group-hover:scale-110 transition-transform">
                 <Layers size={24} />
               </div>
               <div>
                 <h3 className="text-xl font-bold text-gray-800">Pacotes em Atendimento</h3>
                 <p className="text-xs text-gray-400 font-medium">
                    {activePackages && activePackages.length > 0 ? `${activePackages.length} pacote(s) ativo(s).` : 'Nenhum pacote ativo.'}
                 </p>
               </div>
            </div>
            <div className={`text-gray-400 transition-transform duration-300 ${isPackagesExpanded ? 'rotate-180' : ''}`}>
                <ChevronDown size={20} />
            </div>
          </button>
          {isPackagesExpanded && (
             <div className="px-6 md:px-8 pb-6 md:pb-8 animate-in slide-in-from-top-4 duration-300 fade-in border-t border-gray-50 pt-6">
               {activePackages && activePackages.length > 0 ? (
                 <div className="grid grid-cols-1 gap-4">
                   {activePackages.map((pkg) => (
                     <div key={pkg.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-all">
                        <div className="flex items-center gap-4">
                            <div 
                                className="relative cursor-pointer group"
                                onClick={(e) => { e.stopPropagation(); setViewingImage(pkg.avatar); }}
                            >
                                <img src={pkg.avatar} alt={pkg.client} className="w-12 h-12 rounded-full border-2 border-white shadow-sm object-cover group-hover:scale-110 transition-transform" />
                                <div className="absolute inset-0 bg-black/10 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                    <ZoomIn size={14} className="text-white" />
                                </div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-gray-900 truncate">{pkg.client}</h4>
                                <p className="text-xs text-gray-500 mb-2 truncate">{pkg.service}</p>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-3">
                                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                            <div 
                                                className="h-full bg-blue-50 rounded-full transition-all duration-500" 
                                                style={{ width: `${(pkg.current / pkg.total) * 100}%` }}
                                            ></div>
                                        </div>
                                        <span className="text-xs font-bold text-blue-600 whitespace-nowrap">{pkg.current}/{pkg.total}</span>
                                    </div>
                                    <p className="text-[11px] text-gray-800 font-black uppercase tracking-wider mt-1">
                                        Faltam {pkg.total - pkg.current} sessões
                                    </p>
                                </div>
                            </div>
                            <div className="text-right hidden sm:block">
                                {pkg.status === 'IN_PROGRESS' ? (
                                    <button 
                                        type="button"
                                        onClick={() => onFinishSession(pkg.id)}
                                        className="py-1.5 px-3 rounded-lg bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-wide hover:bg-emerald-200 transition-colors"
                                    >
                                        Concluir Sessão
                                    </button>
                                ) : (
                                    <>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Próxima Sessão</p>
                                        <div className="flex items-center justify-end gap-1 text-gray-700 font-bold">
                                            <Calendar size={14} className="text-blue-500" />
                                            {pkg.next}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                     </div>
                   ))}
                 </div>
               ) : (
                 <div className="text-center py-8 text-gray-400 text-sm">Nenhum pacote em andamento.</div>
               )}
             </div>
          )}
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden transition-all">
          <button 
             onClick={() => setIsQueueExpanded(!isQueueExpanded)}
             className="w-full flex items-center justify-between p-6 md:p-8 bg-white hover:bg-gray-50/80 transition-colors cursor-pointer text-left outline-none group"
          >
            <div className="flex items-center gap-3">
               <div className="bg-orange-100 p-2 rounded-xl text-orange-600">
                 <ListOrdered size={24} />
               </div>
               <div>
                 <h3 className="text-xl font-bold text-gray-800">Fila de Espera</h3>
                 <p className="text-xs text-gray-400 font-medium">
                    {queue.length > 0 ? `${queue.length} cliente(s) aguardando.` : 'Fila vazia.'}
                 </p>
               </div>
            </div>
            <div className={`text-gray-400 transition-transform duration-300 ${isQueueExpanded ? 'rotate-180' : ''}`}>
                <ChevronDown size={20} />
            </div>
          </button>
          {isQueueExpanded && (
             <div className="px-6 md:px-8 pb-6 md:pb-8 animate-in slide-in-from-top-4 duration-300 fade-in border-t border-gray-50 pt-6">
               {queue.length > 0 ? (
                 <div className="grid grid-cols-1 gap-4">
                   {queue.map((item) => {
                     const isPackage = item.category === 'PACKAGE';
                     return (
                         <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-all flex flex-col sm:flex-row items-center gap-4">
                             <div 
                                className="relative shrink-0 group cursor-pointer"
                                onClick={(e) => { 
                                    if(item.clientAvatar) {
                                        e.stopPropagation(); 
                                        setViewingImage(item.clientAvatar); 
                                    }
                                }}
                             >
                                 {item.clientAvatar ? (
                                     <>
                                        <img src={item.clientAvatar} alt={item.clientName} className="w-12 h-12 rounded-full object-cover border-2 border-orange-100 group-hover:scale-110 transition-transform" />
                                        <div className="absolute inset-0 bg-black/10 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                            <ZoomIn size={14} className="text-white" />
                                        </div>
                                     </>
                                 ) : (
                                     <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-lg">
                                         {item.clientName.charAt(0)}
                                     </div>
                                 )}
                             </div>
                             <div className="flex-1 min-w-0 text-center sm:text-left">
                                 <h4 className="font-bold text-gray-900 truncate">{item.clientName}</h4>
                                 <div className="flex items-center justify-center sm:justify-start gap-2 mt-1 mb-2">
                                     <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide ${isPackage ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                                         {isPackage ? 'Pacote' : 'Serviço'}
                                     </span>
                                     <span className="text-xs text-gray-500 truncate max-w-[120px] sm:max-w-none">{item.serviceName}</span>
                                 </div>
                                 <div className="flex items-center justify-center sm:justify-start gap-1 text-xs text-gray-400 font-medium">
                                     <Clock size={12} />
                                     <span>Aguardando há {getQueueTime(item.addedAt)}</span>
                                 </div>
                             </div>
                             <div className="flex gap-2 w-full sm:w-auto">
                                 <button 
                                     type="button"
                                     onClick={() => onRemoveFromQueue(item.id)}
                                     className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                                     title="Remover da Fila"
                                 >
                                     <Trash2 size={18} />
                                 </button>
                                 <button 
                                     type="button"
                                     onClick={() => onPromoteQueueToAppointment(item)}
                                     className="flex-1 sm:flex-none px-4 py-2 bg-emerald-500 text-white font-bold text-xs rounded-lg shadow-md shadow-emerald-200 hover:bg-emerald-600 transition-all flex items-center justify-center gap-2"
                                 >
                                     <span>Agendar</span>
                                     <ArrowRight size={14} />
                                 </button>
                             </div>
                         </div>
                     );
                   })}
                 </div>
               ) : (
                 <div className="text-center py-8 text-gray-400 text-sm italic">
                    Nenhum cliente na fila de espera.
                 </div>
               )}
             </div>
          )}
      </div>
      
      {userPermissions.financial && (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden transition-all">
            <button 
                onClick={() => setIsPendingExpanded(!isPendingExpanded)}
                className="w-full flex items-center justify-between p-6 md:p-8 bg-white hover:bg-gray-50/80 transition-colors cursor-pointer text-left outline-none group"
            >
                <div className="flex items-center gap-3">
                <div className="bg-orange-100 p-2 rounded-xl text-orange-500 group-hover:scale-110 transition-transform">
                    <AlertCircle size={24} />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-gray-800">Pagamentos Pendentes</h3>
                    <p className="text-xs text-gray-400 font-medium">
                        {pendingInstallments.length > 0 ? `${pendingInstallments.length} cobrança(s) pendente(s).` : 'Tudo em dia.'}
                    </p>
                </div>
                </div>
                <div className={`text-gray-400 transition-transform duration-300 ${isPendingExpanded ? 'rotate-180' : ''}`}>
                    <ChevronDown size={20} />
                </div>
            </button>
            {isPendingExpanded && (
                <div className="px-6 md:px-8 pb-6 md:pb-8 animate-in slide-in-from-top-4 duration-300 fade-in border-t border-gray-50 pt-6">
                {pendingInstallments && pendingInstallments.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4">
                    {pendingInstallments.map((item) => (
                        <div 
                            key={`${item.saleId}-${item.installment.number}`} 
                            className="group bg-white rounded-xl shadow-sm hover:shadow-md border border-gray-100 transition-all overflow-hidden flex flex-col"
                        >
                            <div className={`h-1.5 w-full ${item.isOverdue ? 'bg-rose-500' : 'bg-cyan-500'}`} />
                            <div className="p-5 flex flex-col md:flex-row md:items-center gap-6">
                                <div className="flex-1 flex items-start gap-4">
                                <div 
                                        className="relative shrink-0 cursor-pointer group"
                                        onClick={(e) => { 
                                            if (item.clientAvatar) {
                                                e.stopPropagation(); 
                                                setViewingImage(item.clientAvatar); 
                                            }
                                        }}
                                >
                                    {item.clientAvatar ? (
                                        <>
                                            <img src={item.clientAvatar} className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm group-hover:scale-110 transition-transform" alt={item.clientName} />
                                            <div className="absolute inset-0 bg-black/10 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                <ZoomIn size={14} className="text-white" />
                                            </div>
                                        </>
                                    ) : (
                                        <div className="w-12 h-12 rounded-full bg-lilac-100 flex items-center justify-center text-lilac-600 font-bold text-lg">
                                            {item.clientName.charAt(0)}
                                        </div>
                                    )}
                                    {item.isOverdue && (
                                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-red-500 border-2 border-white rounded-full flex items-center justify-center pointer-events-none">
                                            <AlertCircle size={12} className="text-white" />
                                        </div>
                                    )}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2 mb-0.5">
                                        <h4 className="font-bold text-gray-900 truncate">{item.clientName}</h4>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide ${item.isOverdue ? 'bg-red-100 text-red-600' : 'bg-cyan-100 text-cyan-600'}`}>
                                            {item.isOverdue ? 'Em Atraso' : 'A Vencer'}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500 truncate mb-2">{item.productNames}</p>
                                    <div className="flex items-center gap-3 text-xs text-gray-500 font-medium bg-gray-50 w-fit px-2 py-1 rounded-lg border border-gray-100">
                                        <span className="flex items-center gap-1">
                                            <Receipt size={12} className="text-gray-400" />
                                            Parcela {item.installment.number}/{item.totalInstallments}
                                        </span>
                                        <span className="w-px h-3 bg-gray-300"></span>
                                        <span className={`flex items-center gap-1 ${item.isOverdue ? 'text-rose-500 font-bold' : ''}`}>
                                            <Calendar size={12} className={item.isOverdue ? 'text-rose-500' : 'text-gray-400'} />
                                            {new Date(item.installment.dueDate + 'T12:00:00').toLocaleDateString('pt-BR')}
                                        </span>
                                    </div>
                                </div>
                                </div>
                                <div className="flex items-center justify-between md:justify-end gap-4 md:gap-6 border-t md:border-t-0 border-gray-50 pt-4 md:pt-0 w-full md:w-auto">
                                    <div className="text-left md:text-right">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Valor</p>
                                    <p className={`text-lg font-bold ${item.isOverdue ? 'text-rose-600' : 'text-gray-900'}`}>
                                        R$ {item.installment.value.toFixed(2).replace('.', ',')}
                                    </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                    <button 
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); sendBillingMessage(item, pixKey); }}
                                        className="px-3 py-2 rounded-lg bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-wider hover:bg-emerald-200 transition-colors border border-emerald-200"
                                        title="Cobrar no WhatsApp"
                                    >
                                        COBRAR
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={(e) => { 
                                            e.stopPropagation(); 
                                            handleQuickPay(item.saleId, item.installment.number); 
                                        }}
                                        className="px-3 py-2 rounded-lg bg-blue-100 text-blue-700 text-[10px] font-bold uppercase tracking-wider hover:bg-blue-200 transition-colors border border-blue-200"
                                        title="Baixar Parcela"
                                    >
                                        PAGO
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); setSelectedPayment(item); }}
                                        className="px-3 py-2 rounded-lg bg-gray-100 text-gray-600 text-[10px] font-bold uppercase tracking-wider hover:bg-purple-100 hover:text-purple-700 transition-colors border border-gray-200"
                                        title="Ver Detalhes"
                                    >
                                        DETALHE
                                    </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    </div>
                ) : (
                    <div className="text-center py-16 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center">
                    <div className="w-16 h-16 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mb-4 shadow-sm">
                        <Wallet size={32} strokeWidth={2.5} />
                    </div>
                    <h4 className="text-gray-800 font-bold text-lg">Tudo em dia!</h4>
                    <p className="text-gray-500 text-sm mt-1">Nenhum pagamento pendente no momento.</p>
                    </div>
                )}
                </div>
            )}
          </div>
      )}

      {plan !== 'ESSENTIAL' && loyaltyEnabled && userPermissions.loyalty && (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden transition-all">
              <button 
                 onClick={() => setIsLoyaltyExpanded(!isLoyaltyExpanded)}
                 className="w-full flex items-center justify-between p-6 md:p-8 bg-white hover:bg-gray-50/80 transition-colors cursor-pointer text-left outline-none group"
              >
                <div className="flex items-center gap-3">
                   <div className="bg-pink-100 p-2 rounded-xl text-pink-500 group-hover:scale-110 transition-transform">
                     <Gift size={24} />
                   </div>
                   <div>
                     <h3 className="text-xl font-bold text-gray-800">Clientes Fidelizados</h3>
                     <p className="text-xs text-gray-400 font-medium">
                        {pendingRedemptions.length > 0 ? `${pendingRedemptions.length} prêmio(s) a resgatar.` : 'Nenhum prêmio pendente.'}
                     </p>
                   </div>
                </div>
                <div className={`text-gray-400 transition-transform duration-300 ${isLoyaltyExpanded ? 'rotate-180' : ''}`}>
                    <ChevronDown size={20} />
                </div>
              </button>
              {isLoyaltyExpanded && (
                 <div className="px-6 md:px-8 pb-6 md:pb-8 animate-in slide-in-from-top-4 duration-300 fade-in border-t border-gray-50 pt-6">
                   {pendingRedemptions.length > 0 ? (
                     <div className="grid grid-cols-1 gap-4">
                        {pendingRedemptions.map(item => (
                            <div key={item.id} className="bg-white rounded-xl border border-pink-100 shadow-sm p-4 flex flex-col md:flex-row items-center gap-6 relative overflow-hidden hover:shadow-md transition-all">
                                <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-gradient-to-b from-pink-500 to-purple-500"></div>
                                <div className="flex items-center gap-4 flex-1">
                                    <div 
                                        className="relative shrink-0 cursor-pointer group"
                                        onClick={(e) => { 
                                            if (item.clientAvatar) {
                                                e.stopPropagation(); 
                                                setViewingImage(item.clientAvatar); 
                                            }
                                        }}
                                    >
                                        {item.clientAvatar ? (
                                            <>
                                                <img src={item.clientAvatar} alt={item.clientName} className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm group-hover:scale-110 transition-transform" />
                                                <div className="absolute inset-0 bg-black/10 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                    <ZoomIn size={14} className="text-white" />
                                                </div>
                                            </>
                                        ) : (
                                            <div className="w-14 h-14 rounded-full bg-lilac-100 flex items-center justify-center text-lilac-600 font-bold text-xl">
                                                {item.clientName.charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="font-bold text-gray-900 truncate leading-tight">{item.clientName}</h4>
                                        <div className="flex items-center gap-1.5 text-xs text-rose-500 font-bold mt-1">
                                            <Sparkles size={12} fill="currentColor" />
                                            <span>Prêmio: {item.productName}</span>
                                        </div>
                                        <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest mt-1.5">
                                            Vence em: {new Date(item.expiryDate + 'T12:00:00').toLocaleDateString('pt-BR')}
                                        </p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => onConfirmRedemption(item)}
                                    className="w-full md:w-auto px-6 py-2.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-100 hover:shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                                >
                                    <Calendar size={16} />
                                    <span>AGENDAR RESGATE</span>
                                </button>
                            </div>
                        ))}
                     </div>
                   ) : (
                     <div className="text-center py-8 text-gray-400 text-sm">Nenhum prêmio pendente de resgate.</div>
                   )}
                 </div>
              )}
          </div>
      )}

      {stockEnabled && userPermissions.stock && (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden transition-all">
          <button 
             onClick={() => setIsShoppingExpanded(!isShoppingExpanded)}
             className="w-full flex items-center justify-between p-6 md:p-8 bg-white hover:bg-gray-50/80 transition-colors cursor-pointer text-left outline-none group"
          >
            <div className="flex items-center gap-3">
               <div className="bg-amber-100 p-2 rounded-xl text-amber-600 group-hover:scale-110 transition-transform">
                 <ShoppingCart size={24} />
               </div>
               <div>
                 <h3 className="text-xl font-bold text-gray-800">Fazer Compras</h3>
                 <p className="text-xs text-gray-400 font-medium">
                    {lowStockItems.length > 0 ? `${lowStockItems.length} item(s) com estoque baixo.` : 'Estoque abastecido.'}
                 </p>
               </div>
            </div>
            <div className={`text-gray-400 transition-transform duration-300 ${isShoppingExpanded ? 'rotate-180' : ''}`}>
                <ChevronDown size={20} />
            </div>
          </button>
          {isShoppingExpanded && (
             <div className="px-6 md:px-8 pb-6 md:pb-8 animate-in slide-in-from-top-4 duration-300 fade-in border-t border-gray-50 pt-6">
                
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6 bg-amber-50/50 p-4 rounded-2xl border border-amber-100">
                    <div className="flex items-center gap-3">
                        <div className="bg-white p-2 rounded-xl text-amber-500 shadow-sm border border-amber-100">
                           <AlertTriangle size={20} />
                        </div>
                        <div>
                           <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Alerta de Reposição</p>
                           <p className="text-sm font-medium text-gray-700">Envie a lista de compras para seu fornecedor ou responsável.</p>
                        </div>
                    </div>
                    <button 
                        onClick={onSendStockReport}
                        disabled={lowStockItems.length === 0}
                        className="w-full md:w-auto px-6 py-3 bg-amber-500 text-white rounded-xl font-black text-xs hover:bg-amber-600 shadow-lg shadow-amber-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:shadow-none"
                    >
                        <Send size={16} />
                        ENVIAR LISTA PELO WHATSAPP
                    </button>
                </div>

                {lowStockItems.length > 0 ? (
                    <div className="grid grid-cols-1 gap-3">
                        {lowStockItems.map(item => {
                            const cat = categories.find(c => c.id === item.categoryId);
                            const isReported = reportedProductIds.includes(item.id);
                            return (
                                <div key={item.id} className="group bg-white rounded-xl border border-gray-100 p-4 flex flex-col md:flex-row md:items-center gap-4 hover:shadow-md transition-all">
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center shrink-0 border border-gray-200 overflow-hidden">
                                            {item.image ? <img src={item.image} className="w-full h-full object-cover" /> : <Package size={20} className="text-gray-300" />}
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className="font-bold text-gray-900 truncate leading-tight">{item.name}</h4>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-[9px] font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded uppercase border border-red-100">
                                                    Estoque: {Math.floor(item.quantity)} un
                                                </span>
                                                <span className="text-[9px] font-bold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded uppercase">
                                                    Mínimo: {item.minQuantity || 5} un
                                                </span>
                                                {isReported && (
                                                    <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded uppercase border border-emerald-100 flex items-center gap-1">
                                                        <Check size={10} strokeWidth={3} /> Notificado
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => setReplenishTarget(item)}
                                        className="w-full md:w-auto px-4 py-2.5 rounded-xl border-2 border-amber-500 text-amber-600 font-bold text-xs hover:bg-amber-500 hover:text-white transition-all flex items-center justify-center gap-2"
                                    >
                                        <PlusCircle size={16} />
                                        REPOR ESTOQUE
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center">
                        <CheckCircle2 size={40} className="text-emerald-400 mb-2" />
                        <p className="text-gray-500 font-medium">Todos os itens estão com estoque em dia.</p>
                    </div>
                )}
             </div>
          )}
        </div>
      )}
    </div>
  );
};
