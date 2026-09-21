import React, { useState, useEffect, useMemo } from 'react';
import { X, Calendar, CreditCard, Banknote, QrCode, DollarSign, ChevronRight, CheckCircle2, ArrowLeft, Copy, Sparkles } from 'lucide-react';
import { Client } from '../types';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (details: any) => void;
  client: Client | null;
  total: number;
  maxInstallments: number;
  pixKey: string;
}

type PaymentMode = 'SELECT' | 'CASH' | 'INSTALLMENTS' | 'PIX_QR';

// CRC16-CCITT implementation for Pix Payload
const crc16ccitt = (text: string) => {
    let crc = 0xFFFF;
    for (let i = 0; i < text.length; i++) {
        let c = text.charCodeAt(i);
        crc ^= (c << 8) & 0xFFFF;
        for (let j = 0; j < 8; j++) {
            if (crc & 0x8000) {
                crc = ((crc << 1) ^ 0x1021) & 0xFFFF;
            } else {
                crc = (crc << 1) & 0xFFFF;
            }
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
  
  // 1. Email
  if (clean.includes('@')) return clean.toLowerCase();
  
  // 2. UUID/EVP
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(clean)) {
      return clean;
  }

  // 3. Already E.164
  if (clean.startsWith('+')) return clean;

  const digits = clean.replace(/\D/g, '');

  // 4. CNPJ (14 digits) - Explicit Check
  if (digits.length === 14) {
      return digits;
  }

  // 5. Phone vs CPF (11 digits)
  if (digits.length === 11) {
      // If user typed parens OR 3rd digit is 9 (Mobile) -> Treat as Phone (+55)
      if (clean.includes('(') || digits[2] === '9') {
          return `+55${digits}`;
      }
      return digits; // Unformatted CPF
  }

  // 6. Old Phone Format (12 digits starting with 0)
  if (digits.length === 12 && digits.startsWith('0') && digits[3] === '9') {
      const fixed = digits.substring(1);
      if (fixed[2] === '9') return `+55${fixed}`;
  }

  // Default: Return digits (CNPJ 14, etc)
  return digits;
};

const generatePixPayload = (key: string, amount: number) => {
    const cleanKey = normalizePixKey(key);
    const amountStr = amount.toFixed(2);
    
    // Merchant Account Info
    const gui = formatField('00', 'br.gov.bcb.pix');
    const keyField = formatField('01', cleanKey);
    const merchantAccount = formatField('26', gui + keyField);
    
    let payload = 
      formatField('00', '01') + // Payload Format Indicator
      merchantAccount + 
      formatField('52', '0000') + // MCC
      formatField('53', '986') + // Currency (BRL)
      formatField('54', amountStr) + // Transaction Amount
      formatField('58', 'BR') + // Country Code
      formatField('59', 'GENDLY APP') + // Merchant Name (Placeholder)
      formatField('60', 'SAO PAULO') + // Merchant City (Placeholder)
      formatField('62', formatField('05', '***')); // Additional Data Field (TxID)
      
    payload += '6304'; // CRC16 ID
    
    const crc = crc16ccitt(payload);
    return payload + crc;
};

export const PaymentModal: React.FC<PaymentModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  client, 
  total,
  maxInstallments,
  pixKey
}) => {
  const [mode, setMode] = useState<PaymentMode>('SELECT');
  const [date, setDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [installments, setInstallments] = useState(1);
  const [pixPayload, setPixPayload] = useState('');
  
  // Success state
  const [showSuccess, setShowSuccess] = useState(false);

  // Helper for current date string (Local Time)
  const todayStr = useMemo(() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);
  
  // Reset state on open
  useEffect(() => {
    if (isOpen) {
      setMode('SELECT');
      setDate(todayStr); // Default to today local
      setPaymentMethod('');
      setInstallments(1);
      setPixPayload('');
      setShowSuccess(false);
    }
  }, [isOpen, todayStr]);

  if (!isOpen || !client) return null;

  const isToday = (dateString: string) => {
    return dateString === todayStr;
  };

  const handleGeneratePix = () => {
      if (!pixKey) {
          alert('Configure sua chave Pix em "Ajustes" para gerar o QR Code.');
          return;
      }
      const payload = generatePixPayload(pixKey, total);
      setPixPayload(payload);
      setMode('PIX_QR');
  };

  const handleConfirm = () => {
    // If method is PIX (Cash mode + PIX selected), show QR code first
    if (mode === 'CASH' && isToday(date) && paymentMethod === 'PIX') {
        handleGeneratePix();
        return;
    }

    const processConfirm = () => {
        onConfirm({
            type: mode === 'PIX_QR' ? 'CASH' : mode, // Map PIX_QR back to CASH for storage
            date,
            method: mode === 'PIX_QR' ? 'PIX' : (isToday(date) && mode === 'CASH' ? paymentMethod : null),
            installments: mode === 'INSTALLMENTS' ? installments : 1,
            total
        });
    };

    // If payment is immediate (Cash/Pix today), show animation
    const isImmediate = (mode === 'PIX_QR') || (mode === 'CASH' && isToday(date));

    if (isImmediate) {
        setShowSuccess(true);
        setTimeout(() => {
            processConfirm();
        }, 2000);
    } else {
        processConfirm();
    }
  };

  const renderSummary = () => (
    <div className="bg-gray-50 p-6 rounded-2xl mb-6 border border-gray-100">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-500">Cliente</span>
        <span className="font-bold text-gray-800">{client.nickname || client.name}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">Valor Total</span>
        <span className="text-2xl font-bold gradient-text">R$ {total.toFixed(2).replace('.', ',')}</span>
      </div>
    </div>
  );

  const calculateInstallments = () => {
    const valuePerInstallment = total / installments;
    const dates = [];
    const startDate = new Date(date);

    for (let i = 0; i < installments; i++) {
      const d = new Date(startDate);
      d.setMonth(d.getMonth() + i);
      dates.push({
        num: i + 1,
        date: d.toLocaleDateString('pt-BR'),
        value: valuePerInstallment
      });
    }
    return dates;
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-lilac-900/40 backdrop-blur-sm p-4 transition-opacity">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh] relative">
        
        {/* --- SUCCESS OVERLAY --- */}
        {showSuccess && (
           <div className="absolute inset-0 z-[100] bg-white/90 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300">
              <div className="text-center">
                 <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-100">
                    <CheckCircle2 size={56} className="text-emerald-500 animate-bounce" strokeWidth={3} />
                 </div>
                 <h2 className="text-3xl font-bold text-gray-800 mb-2">Pagamento Confirmado!</h2>
                 <p className="text-gray-500 font-medium">Tudo certo, pagamento recebido.</p>
                 <div className="mt-8 flex justify-center">
                    <div className="flex items-center gap-2 text-emerald-600 font-bold bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100">
                        <Sparkles size={16} />
                        <span>Processando...</span>
                    </div>
                 </div>
              </div>
           </div>
        )}

        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
             {mode !== 'SELECT' && mode !== 'PIX_QR' && (
               <button onClick={() => setMode('SELECT')} className="p-1 -ml-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full">
                 <ArrowLeft size={20} />
               </button>
             )}
             {mode === 'PIX_QR' && (
                <button onClick={() => setMode('CASH')} className="p-1 -ml-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full">
                    <ArrowLeft size={20} />
                </button>
             )}
             <div>
                <h2 className="text-xl font-bold text-gray-800">Pagamento</h2>
                <p className="text-xs text-gray-400 font-medium">
                    {mode === 'PIX_QR' ? 'Escaneie para pagar' : 'Defina como será pago'}
                </p>
             </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-50 rounded-full">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          {mode !== 'PIX_QR' && renderSummary()}

          {mode === 'SELECT' && (
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => setMode('CASH')}
                className="flex flex-col items-center gap-3 p-6 rounded-2xl border-2 border-gray-100 hover:border-purple-400 hover:bg-purple-50 transition-all group"
              >
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <DollarSign size={24} strokeWidth={2.5} />
                </div>
                <span className="font-bold text-gray-700">À Vista</span>
              </button>

              <button 
                onClick={() => setMode('INSTALLMENTS')}
                className="flex flex-col items-center gap-3 p-6 rounded-2xl border-2 border-gray-100 hover:border-pink-400 hover:bg-pink-50 transition-all group"
              >
                <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Calendar size={24} strokeWidth={2.5} />
                </div>
                <span className="font-bold text-gray-700">Parcelar</span>
              </button>
            </div>
          )}

          {mode === 'CASH' && (
            <div className="space-y-6 animate-in slide-in-from-right duration-300">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Data do Pagamento</label>
                <input 
                  type="date" 
                  value={date}
                  min={todayStr}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-200"
                />
              </div>

              {isToday(date) && (
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Método de Pagamento</label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: 'PIX', label: 'Pix', icon: QrCode },
                      { id: 'CREDIT', label: 'Crédito', icon: CreditCard },
                      { id: 'DEBIT', label: 'Débito', icon: CreditCard },
                      { id: 'MONEY', label: 'Dinheiro', icon: Banknote },
                    ].map((m) => (
                      <button
                        key={m.id}
                        onClick={() => setPaymentMethod(m.id)}
                        className={`flex items-center gap-2 p-3 rounded-xl border transition-all ${paymentMethod === m.id ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-gray-200 hover:bg-gray-50 text-gray-600'}`}
                      >
                        <m.icon size={18} />
                        <span className="font-bold text-sm">{m.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <button 
                onClick={handleConfirm}
                disabled={isToday(date) && !paymentMethod}
                className="w-full py-4 rounded-xl font-bold text-white sidebar-gradient shadow-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 mt-4"
              >
                <CheckCircle2 size={20} />
                <span>Confirmar Pagamento</span>
              </button>
            </div>
          )}

          {mode === 'INSTALLMENTS' && (
            <div className="space-y-6 animate-in slide-in-from-right duration-300">
               <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Parcelas</label>
                    <select
                      value={installments}
                      onChange={(e) => setInstallments(Number(e.target.value))}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-200 appearance-none"
                    >
                      {Array.from({ length: maxInstallments }).map((_, i) => (
                        <option key={i} value={i + 1}>{i + 1}x</option>
                      ))}
                    </select>
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">1ª Parcela</label>
                    <input 
                      type="date" 
                      value={date}
                      min={todayStr}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-200"
                    />
                 </div>
               </div>

               <div className="bg-gray-50 rounded-xl p-4 max-h-48 overflow-y-auto border border-gray-100">
                  <h4 className="text-xs font-bold text-gray-400 uppercase mb-3">Simulação</h4>
                  <div className="space-y-2">
                    {calculateInstallments().map((inst) => (
                      <div key={inst.num} className="flex justify-between text-sm">
                        <span className="text-gray-600 font-medium">{inst.num}ª Parcela ({inst.date})</span>
                        <span className="font-bold text-gray-800">R$ {inst.value.toFixed(2).replace('.', ',')}</span>
                      </div>
                    ))}
                  </div>
               </div>

               <div className="pt-2 border-t border-gray-100 flex justify-between items-center">
                  <span className="text-sm text-gray-500 font-medium">Valor da Parcela</span>
                  <span className="text-lg font-bold text-purple-600">R$ {(total / installments).toFixed(2).replace('.', ',')}</span>
               </div>

               <button 
                onClick={handleConfirm}
                className="w-full py-4 rounded-xl font-bold text-white sidebar-gradient shadow-lg hover:opacity-90 transition-all flex justify-center items-center gap-2"
              >
                <CheckCircle2 size={20} />
                <span>Gerar Parcelamento</span>
              </button>
            </div>
          )}

          {mode === 'PIX_QR' && (
            <div className="flex flex-col items-center space-y-6 animate-in zoom-in duration-300">
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(pixPayload)}`} 
                        alt="QR Code Pix" 
                        className="w-48 h-48 object-contain"
                    />
                </div>
                
                <div className="w-full bg-gray-50 p-3 rounded-xl border border-gray-200 flex items-center gap-2">
                    <div className="flex-1 overflow-hidden">
                        <div className="text-[10px] text-gray-400 uppercase font-bold">Pix Copia e Cola</div>
                        <div className="text-xs font-mono text-gray-600 truncate">{pixPayload}</div>
                    </div>
                    <button 
                        onClick={() => navigator.clipboard.writeText(pixPayload)}
                        className="p-2 bg-white rounded-lg shadow-sm hover:bg-gray-50 text-purple-600 transition-colors"
                    >
                        <Copy size={16} />
                    </button>
                </div>

                <div className="text-center">
                    <p className="font-bold text-gray-800 text-lg">R$ {total.toFixed(2).replace('.', ',')}</p>
                    <p className="text-sm text-gray-500">Aguardando pagamento...</p>
                </div>

                <button 
                    onClick={handleConfirm}
                    className="w-full py-4 rounded-xl font-bold text-white sidebar-gradient shadow-lg hover:opacity-90 transition-all flex justify-center items-center gap-2"
                >
                    <CheckCircle2 size={20} />
                    <span>Pagamento Realizado</span>
                </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};