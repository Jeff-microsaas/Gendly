
import React, { useState, useMemo, useEffect } from 'react';
import { X, Search, Plus, Minus, ShoppingBag, Trash2, Package, CreditCard, Calendar, Banknote, QrCode, Copy, DollarSign, ChevronDown, Check, AlertCircle, ExternalLink, Clock, Sparkles, CheckCircle2, Gift, Tag } from 'lucide-react';
import { Product, Client, Promotion } from '../types';

interface SalesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFinish: (items: { product: Product; quantity: number }[], total: number, paymentDetails: any) => void;
  client: Client | null;
  products: Product[]; // Should be Store Products only
  maxInstallments: number;
  pixKey: string;
  interestRate?: number;
  interestStart?: number;
  initialCart?: { product: Product; quantity: number }[]; // New Prop
  promotions?: Promotion[];
}

// --- HELPER: PIX GENERATION & UTILS ---
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

export const SalesModal: React.FC<SalesModalProps> = ({ 
    isOpen, 
    onClose, 
    onFinish, 
    client, 
    products, 
    maxInstallments = 12,
    pixKey,
    interestRate = 0,
    interestStart = 999,
    initialCart = [],
    promotions = []
}) => {
  const [activeTab, setActiveTab] = useState<'products' | 'checkout'>('products');
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
  const [paymentType, setPaymentType] = useState<'CASH' | 'INSTALLMENTS'>('CASH');
  const [paymentDate, setPaymentDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<string>(''); 
  const [installments, setInstallments] = useState(1);
  const [showPixOverlay, setShowPixOverlay] = useState(false);
  const [pixPayload, setPixPayload] = useState('');
  const [hasCopied, setHasCopied] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const todayStr = useMemo(() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  useEffect(() => {
    if (isOpen) {
      setCart(initialCart);
      setSearchTerm('');
      setActiveTab(initialCart.length > 0 ? 'checkout' : 'products');
      setPaymentType('CASH');
      setPaymentDate(todayStr);
      setPaymentMethod('MONEY');
      setInstallments(1);
      setShowPixOverlay(false);
      setHasCopied(false);
      setShowSuccess(false);
    }
  }, [isOpen, initialCart, todayStr]);

  // FILTRAGEM ROBUSTA: Garante que apenas ITENS DE LOJA (type: PRODUCT) apareçam na lista de busca
  const filteredProducts = useMemo(() => {
    return products.filter(p => 
      p.type === 'PRODUCT' && 
      (p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
       p.sku.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [products, searchTerm]);

  const findActivePromo = (itemId: string) => {
    const today = new Date().toISOString().split('T')[0];
    return promotions.find(p => 
      p.itemId === itemId && 
      p.expiryDate >= today && 
      (p.targetClientIds.length === 0 || (client && p.targetClientIds.includes(client.id)))
    );
  };

  const addToCart = (product: Product) => {
    const promo = findActivePromo(product.id);
    const finalProduct = promo ? { ...product, price: promo.promoPrice } : product;

    setCart(prev => {
      const existing = prev.find(item => item.product.id === finalProduct.id);
      if (existing) {
        if (existing.quantity >= product.quantity) return prev;
        return prev.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { product: finalProduct, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
        if (item.product.id === productId) {
          const newQty = item.quantity + delta;
          if (newQty > item.product.quantity) return item; 
          return { ...item, quantity: newQty };
        }
        return item;
    }).filter(item => item.quantity > 0));
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const rawTotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const finalTotal = useMemo(() => {
      if (paymentType === 'INSTALLMENTS' && installments >= (interestStart || 999) && (interestRate || 0) > 0 && paymentMethod === 'PIX') {
          return rawTotal * (1 + (interestRate || 0) / 100);
      }
      return rawTotal;
  }, [rawTotal, paymentType, installments, interestStart, interestRate, paymentMethod]);

  const installmentValue = finalTotal / Math.max(1, installments);

  const isToday = (dateString: string) => {
    return dateString === todayStr;
  };

  const handleCopyPix = () => {
    navigator.clipboard.writeText(pixPayload);
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 3000);
  };

  const generatePixAndOpen = () => {
      if (!pixKey) {
          alert("Por favor, configure sua chave PIX em Ajustes antes de usar esta opção.");
          return;
      }
      const payload = generatePixPayload(pixKey, finalTotal);
      setPixPayload(payload);
      setShowPixOverlay(true);
  };

  const finalizeSale = (status: 'PAID' | 'PENDING') => {
      const finishProcess = () => {
        onFinish(cart, finalTotal, {
            type: paymentType,
            date: paymentDate,
            method: finalTotal === 0 ? 'OTHER' : paymentMethod,
            installments: paymentType === 'INSTALLMENTS' ? installments : 1,
            interestApplied: finalTotal > rawTotal,
            status: status
        });
      };

      if (status === 'PAID') {
          setShowPixOverlay(false);
          setShowSuccess(true);
          setTimeout(() => {
              finishProcess();
          }, 2000);
      } else {
          finishProcess();
      }
  };

  const renderActionButtons = () => {
      const isDateToday = isToday(paymentDate);

      if (finalTotal === 0) {
          return (
              <div className="space-y-2">
                  <div className="bg-purple-100 text-purple-700 p-3 rounded-xl text-center font-bold text-sm flex items-center justify-center gap-2">
                      <Gift size={18} />
                      Prêmio / Gratuidade
                  </div>
                  <button type="button" onClick={() => finalizeSale('PAID')} className="w-full py-4 bg-emerald-500 text-white rounded-2xl font-bold text-lg shadow-lg shadow-emerald-200 hover:bg-emerald-600 transition-all flex items-center justify-center gap-2">
                      <CheckCircle2 size={20} /> Concluir (Gratuito)
                  </button>
              </div>
          );
      }

      if (paymentType === 'CASH') {
          if (paymentMethod === 'PIX') {
              if (isDateToday) {
                  return (
                      <button type="button" onClick={generatePixAndOpen} className="w-full py-4 bg-emerald-500 text-white rounded-2xl font-bold text-lg shadow-lg shadow-emerald-200 hover:bg-emerald-600 transition-all flex items-center justify-center gap-2">
                          <QrCode size={20} /> Gerar Codigo Pix
                      </button>
                  );
              } else {
                  return (
                      <button type="button" onClick={() => finalizeSale('PENDING')} className="w-full py-4 bg-orange-500 text-white rounded-2xl font-bold text-lg shadow-lg shadow-orange-200 hover:bg-orange-600 transition-all flex items-center justify-center gap-2">
                          <Clock size={20} /> Pagamento Pendente
                      </button>
                  );
              }
          }
          if (paymentMethod === 'MONEY') {
              if (isDateToday) {
                  return (
                      <button type="button" onClick={() => finalizeSale('PAID')} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold text-lg shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all flex items-center justify-center gap-2">
                          <CheckCircle2 size={20} /> Recebido
                      </button>
                  );
              } else {
                  return (
                      <button type="button" onClick={() => finalizeSale('PENDING')} className="w-full py-4 bg-orange-500 text-white rounded-2xl font-bold text-lg shadow-lg shadow-orange-200 hover:bg-orange-600 transition-all flex items-center justify-center gap-2">
                          <Clock size={20} /> Pagamento Pendente
                      </button>
                  );
              }
          }
      }

      if (paymentType === 'INSTALLMENTS') {
          if (paymentMethod === 'PIX') {
              return (
                  <button type="button" onClick={() => finalizeSale('PENDING')} className="w-full py-4 bg-orange-500 text-white rounded-2xl font-bold text-lg shadow-lg shadow-orange-200 hover:bg-orange-600 transition-all flex items-center justify-center gap-2">
                      <Clock size={20} /> Pagamento Pendente
                  </button>
              );
          }
          if (paymentMethod === 'CARD') {
             return (
                 <div className="grid grid-cols-2 gap-3 w-full">
                    <button type="button" onClick={() => finalizeSale('PENDING')} className="py-4 bg-orange-500 text-white rounded-2xl font-bold text-lg shadow-lg shadow-orange-200 hover:bg-orange-600 transition-all flex items-center justify-center gap-2">
                        <Clock size={20} /> Pendente
                    </button>
                    <button type="button" onClick={() => finalizeSale('PAID')} className="py-4 bg-emerald-500 text-white rounded-2xl font-bold text-lg shadow-lg shadow-emerald-200 hover:bg-emerald-600 transition-all flex items-center justify-center gap-2">
                        <CheckCircle2 size={20} /> Recebido
                    </button>
                 </div>
             );
          }
      }

      return (
          <button type="button" disabled className="w-full py-4 bg-gray-200 text-gray-400 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 cursor-not-allowed">
              Selecione um método
          </button>
      );
  };

  if (!isOpen || !client) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-lilac-900/30 backdrop-blur-sm transition-opacity">
      <div className="bg-white w-full h-[100dvh] md:h-[90vh] md:max-w-6xl md:rounded-3xl shadow-2xl flex flex-col overflow-hidden md:border md:border-white/50 relative">
        
        {showSuccess && (
           <div className="absolute inset-0 z-[100] bg-white/90 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300">
              <div className="text-center">
                 <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-100">
                    <CheckCircle2 size={56} className="text-emerald-500 animate-bounce" strokeWidth={3} />
                 </div>
                 <h2 className="text-3xl font-bold text-gray-800 mb-2">Pagamento Confirmado!</h2>
                 <p className="text-gray-500 font-medium">Tudo certo, a venda foi registrada com sucesso.</p>
                 <div className="mt-8 flex justify-center">
                    <div className="flex items-center gap-2 text-emerald-600 font-bold bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100">
                        <Sparkles size={16} />
                        <span>Processando...</span>
                    </div>
                 </div>
              </div>
           </div>
        )}

        <div className="flex-none h-20 bg-white border-b border-gray-100 flex items-center justify-between px-6 z-20 relative shadow-sm">
          <div className="flex items-center gap-4">
            <div className="relative">
               {client.avatar ? (
                 <img src={client.avatar} alt={client.name} className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md" />
               ) : (
                 <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center text-purple-600 font-bold text-lg border-2 border-white shadow-md">
                   {client.name.charAt(0)}
                 </div>
               )}
               <div className="absolute -bottom-1 -right-1 bg-emerald-400 w-4 h-4 border-2 border-white rounded-full"></div>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Cliente</p>
              <h2 className="text-lg font-bold text-gray-800 leading-none">{client.name}</h2>
            </div>
          </div>
          
          <button onClick={onClose} className="p-2 bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        {showPixOverlay && !showSuccess && (
            <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-200">
                <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 flex flex-col items-center border border-gray-100 relative">
                    
                    <button 
                       onClick={() => setShowPixOverlay(false)}
                       className="absolute top-4 right-4 p-2 text-gray-300 hover:text-gray-500 transition-colors"
                    >
                       <X size={24} />
                    </button>

                    <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                       <QrCode size={32} />
                    </div>

                    <h3 className="text-2xl font-bold text-gray-800 mb-1">Pagamento via Pix</h3>
                    <p className="text-gray-400 text-sm text-center mb-6 leading-relaxed">
                      Use o aplicativo do seu banco para escanear o código abaixo.
                    </p>
                    
                    <div className="bg-white p-4 rounded-2xl border-2 border-gray-100 mb-6 shadow-inner">
                        <img 
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(pixPayload)}`} 
                            alt="QR Code Pix" 
                            className="w-56 h-56 object-contain mix-blend-multiply"
                        />
                    </div>

                    <div className="w-full mb-6">
                       <div className="flex items-center gap-2 w-full mb-2">
                          <div className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs font-mono text-gray-500 truncate select-all">
                             {pixPayload}
                          </div>
                          <button 
                             onClick={handleCopyPix}
                             className={`p-3 rounded-xl transition-all border ${hasCopied ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-purple-50 text-purple-600 hover:bg-purple-100 border-purple-100'}`}
                             title="Copiar código"
                          >
                             {hasCopied ? <Check size={20} /> : <Copy size={20} />}
                          </button>
                       </div>
                       {hasCopied && (
                         <div className="text-center text-xs font-bold text-emerald-600 animate-in slide-in-from-top-2 fade-in">
                           Copiado com sucesso!
                         </div>
                       )}
                    </div>

                    <button 
                        type="button"
                        onClick={() => finalizeSale('PAID')}
                        className="w-full py-4 bg-emerald-500 text-white font-bold rounded-2xl shadow-lg shadow-emerald-200 hover:bg-emerald-600 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                    >
                        <CheckCircle2 size={20} />
                        Confirmar Pagamento
                    </button>
                </div>
            </div>
        )}
        
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-gray-50">
          
          <div className="md:hidden flex-none p-4 bg-white shadow-sm z-10">
            <div className="flex bg-gray-100 p-1 rounded-xl">
              <button 
                onClick={() => setActiveTab('products')}
                className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${activeTab === 'products' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-400'}`}
              >
                <Package size={18} /> Produtos
              </button>
              <button 
                onClick={() => setActiveTab('checkout')}
                className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${activeTab === 'checkout' ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-400'}`}
              >
                <CreditCard size={18} /> Pagamento
                {cart.length > 0 && <span className="bg-purple-600 text-white text-[10px] px-1.5 rounded-full">{totalItems}</span>}
              </button>
            </div>
          </div>

          <div className={`flex-1 flex flex-col overflow-hidden border-r border-gray-200 bg-gray-50/50 ${activeTab === 'products' ? 'flex' : 'hidden md:flex'}`}>
             <div className="p-4 md:p-6 sticky top-0 z-10 bg-gray-50/50 backdrop-blur-sm">
               <div className="relative group">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-500 transition-colors" size={20} />
                 <input 
                   type="text" 
                   placeholder="Buscar produto..." 
                   className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-300 transition-all shadow-sm"
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                 />
               </div>
             </div>

             <div className="flex-1 overflow-y-auto px-4 md:px-6 pb-24 md:pb-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filteredProducts.length > 0 ? filteredProducts.map(product => {
                    const activePromo = findActivePromo(product.id);
                    const currentPrice = activePromo ? activePromo.promoPrice : product.price;

                    const inCart = cart.find(i => i.product.id === product.id);
                    const qty = inCart ? inCart.quantity : 0;
                    const isOutOfStock = product.type === 'PRODUCT' && product.quantity === 0;

                    return (
                      <div key={product.id} className={`bg-white rounded-2xl p-3 md:p-4 border border-gray-100 shadow-sm transition-all ${qty > 0 ? 'ring-2 ring-purple-100 border-purple-200' : 'hover:shadow-md'}`}>
                         <div className="flex gap-4">
                            <div className="w-20 h-20 md:w-24 md:h-24 bg-gray-100 rounded-xl shrink-0 overflow-hidden">
                              {product.image ? (
                                <img src={product.image} className="w-full h-full object-cover" alt={product.name} />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-300"><Package size={24}/></div>
                              )}
                            </div>
                            
                            <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                               <div>
                                 <div className="flex justify-between items-start">
                                   <div className="flex flex-col min-w-0">
                                      <h3 className="font-bold text-gray-800 text-sm md:text-base truncate leading-tight">{product.name}</h3>
                                      {activePromo && (
                                          <div className="inline-flex items-center gap-1 mt-0.5 bg-emerald-50 text-emerald-600 text-[8px] font-black px-1 rounded uppercase w-fit">
                                              <Tag size={8} /> Promoção Ativa
                                          </div>
                                      )}
                                   </div>
                                   {product.sku && <span className="text-[10px] font-mono text-gray-400 bg-gray-50 px-1 rounded hidden lg:block">{product.sku}</span>}
                                 </div>
                                 <p className="text-xs text-gray-400 mt-1">
                                    {product.type === 'PRODUCT' ? `Estoque: ${product.quantity} un` : 'Serviço'}
                                 </p>
                               </div>
                               
                               <div className="flex justify-between items-end mt-2">
                                 <div className="flex flex-col">
                                    {activePromo && <span className="text-[10px] line-through text-gray-400">R$ {product.price.toFixed(2)}</span>}
                                    <span className={`font-bold text-lg ${activePromo ? 'text-emerald-600' : 'text-gray-900'}`}>
                                        R$ {currentPrice.toFixed(2).replace('.',',')}
                                    </span>
                                 </div>
                                 
                                 {qty === 0 ? (
                                    <button 
                                      onClick={() => addToCart(product)}
                                      disabled={isOutOfStock}
                                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isOutOfStock ? 'bg-gray-100 text-gray-300 cursor-not-allowed' : 'bg-gray-900 text-white hover:bg-black'}`}
                                    >
                                      <Plus size={16} />
                                    </button>
                                 ) : (
                                   <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
                                      <button onClick={() => updateQuantity(product.id, -1)} className="w-7 h-7 flex items-center justify-center bg-white rounded-md shadow-sm text-red-500 hover:bg-red-50 transition-colors">
                                        <Minus size={14} />
                                      </button>
                                      <span className="w-7 text-center font-bold text-gray-800 text-sm">{qty}</span>
                                      <button onClick={() => updateQuantity(product.id, 1)} className="w-7 h-7 flex items-center justify-center bg-white rounded-md shadow-sm text-emerald-600 hover:bg-emerald-50 transition-colors">
                                        <Plus size={14} />
                                      </button>
                                   </div>
                                 )}
                               </div>
                            </div>
                         </div>
                      </div>
                    );
                  }) : (
                    <div className="col-span-full text-center py-12 text-gray-400">
                      <Search size={48} className="mx-auto mb-4 opacity-20" />
                      <p>Nenhum produto encontrado.</p>
                    </div>
                  )}
                </div>
             </div>
          </div>

          <div className={`flex-1 md:flex-none w-full md:w-[26rem] lg:w-[30rem] bg-white md:shadow-[-10px_0_30px_-15px_rgba(0,0,0,0.05)] flex flex-col min-h-0 ${activeTab === 'checkout' ? 'flex' : 'hidden md:flex'}`}>
             
             <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-white">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <ShoppingBag size={16} /> Resumo do Pedido
                </h3>
                
                {cart.length === 0 ? (
                  <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                    <p className="text-sm text-gray-500 font-medium">Seu carrinho está vazio.</p>
                    <button onClick={() => setActiveTab('products')} className="mt-3 text-purple-600 font-bold text-sm hover:underline md:hidden">
                      Ir para Produtos
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                     {cart.map(item => (
                        <div key={item.product.id} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-xl transition-colors group">
                           <div className="flex items-center gap-3 overflow-hidden">
                              <div className="w-10 h-10 rounded-lg bg-gray-100 shrink-0">
                                {item.product.image && <img src={item.product.image} className="w-full h-full object-cover rounded-lg" />}
                              </div>
                              <div className="min-w-0">
                                 <div className="font-bold text-gray-800 text-sm truncate">{item.product.name}</div>
                                 <div className="text-xs text-gray-400">{item.quantity}x R$ {item.product.price.toFixed(2)}</div>
                              </div>
                           </div>
                           <div className="flex items-center gap-3">
                              <span className="font-bold text-gray-800 text-sm">R$ {(item.product.price * item.quantity).toFixed(2)}</span>
                              <button onClick={() => removeFromCart(item.product.id)} className="text-red-500 hover:text-red-600 transition-colors p-1">
                                <Trash2 size={16} />
                              </button>
                           </div>
                        </div>
                     ))}
                  </div>
                )}
                
                <div className="border-t border-gray-100 my-6"></div>

                {finalTotal > 0 && (
                    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                        <CreditCard size={16} /> Detalhes do Pagamento
                        </h3>

                        <div className="grid grid-cols-2 gap-3">
                        <button 
                            onClick={() => { setPaymentType('CASH'); setPaymentMethod('MONEY'); }}
                            className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${paymentType === 'CASH' ? 'border-emerald-500 bg-emerald-50/50 text-emerald-700' : 'border-gray-100 hover:border-emerald-200 text-gray-500'}`}
                        >
                            <DollarSign size={24} className={paymentType === 'CASH' ? 'fill-emerald-200' : ''} />
                            <span className="font-bold text-sm">À Vista</span>
                        </button>
                        <button 
                            onClick={() => { setPaymentType('INSTALLMENTS'); setPaymentMethod('CARD'); }}
                            className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${paymentType === 'INSTALLMENTS' ? 'border-blue-500 bg-blue-50/50 text-blue-700' : 'border-gray-100 hover:border-blue-200 text-gray-500'}`}
                        >
                            <Calendar size={24} className={paymentType === 'INSTALLMENTS' ? 'fill-blue-200' : ''} />
                            <span className="font-bold text-sm">Parcelado</span>
                        </button>
                        </div>

                        {paymentType === 'CASH' && (
                        <div className="space-y-4">
                            <div className="relative">
                                <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Data do Pagamento</label>
                                <div className="relative bg-white border border-gray-200 rounded-xl p-3 flex items-center justify-between hover:border-purple-300 transition-all group cursor-pointer">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-gray-50 text-gray-500 flex items-center justify-center group-hover:bg-purple-50 group-hover:text-purple-600 transition-colors">
                                            <Calendar size={20} />
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-gray-800">
                                                {paymentDate ? new Date(paymentDate + 'T12:00:00').toLocaleDateString('pt-BR') : 'Selecione'}
                                            </div>
                                            <div className="text-[10px] text-gray-400 font-bold uppercase">
                                                {isToday(paymentDate) ? 'Pagamento Hoje' : 'Agendado'}
                                            </div>
                                        </div>
                                    </div>
                                    <input 
                                        type="date"
                                        value={paymentDate}
                                        min={todayStr}
                                        onChange={(e) => setPaymentDate(e.target.value)}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 full-click"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Forma de Pagamento</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button onClick={() => setPaymentMethod('PIX')} className={`flex flex-col items-center justify-center py-3 rounded-xl border transition-all gap-1 ${paymentMethod === 'PIX' ? 'bg-emerald-500 text-white border-emerald-500 shadow-md' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                                        <QrCode size={20} />
                                        <span className="text-[10px] font-bold uppercase">Pix</span>
                                    </button>
                                    <button onClick={() => setPaymentMethod('MONEY')} className={`flex flex-col items-center justify-center py-3 rounded-xl border transition-all gap-1 ${paymentMethod === 'MONEY' ? 'bg-emerald-500 text-white border-emerald-500 shadow-md' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                                        <Banknote size={20} />
                                        <span className="text-[10px] font-bold uppercase">Dinheiro</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                        )}

                        {paymentType === 'INSTALLMENTS' && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-3 mb-4">
                                <button 
                                    onClick={() => setPaymentMethod('PIX')}
                                    className={`py-3 rounded-xl border font-bold text-sm transition-all ${paymentMethod === 'PIX' ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-gray-600 border-gray-200'}`}
                                >
                                    Pix
                                </button>
                                <button 
                                    onClick={() => setPaymentMethod('CARD')}
                                    className={`py-3 rounded-xl border font-bold text-sm transition-all ${paymentMethod === 'CARD' ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-gray-600 border-gray-200'}`}
                                >
                                    Cartão
                                </button>
                            </div>
                            
                            {paymentMethod !== 'CARD' && (
                                <>
                                    <div>
                                        <div className="flex justify-between mb-2">
                                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Quantidade</label>
                                            <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded">
                                                {installments}x de R$ {installmentValue.toFixed(2)}
                                            </span>
                                        </div>
                                        
                                        <div className="relative">
                                            <select 
                                                value={installments}
                                                onChange={(e) => setInstallments(Number(e.target.value))}
                                                className="w-full p-4 bg-white border border-gray-200 rounded-2xl appearance-none text-lg font-bold text-gray-800 focus:outline-none focus:border-purple-300 focus:ring-4 focus:ring-purple-50 transition-all"
                                            >
                                                {Array.from({ length: Math.max(1, maxInstallments || 1) }).map((_, i) => (
                                                <option key={i} value={i + 1}>{i + 1}x (Parcelas)</option>
                                                ))}
                                            </select>
                                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                        </div>
                                    </div>

                                    <div className="relative">
                                        <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Vencimento 1ª Parcela</label>
                                        <div className="relative bg-white border border-gray-200 rounded-xl p-3 flex items-center justify-between hover:border-purple-300 transition-all group cursor-pointer">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-gray-50 text-gray-500 flex items-center justify-center group-hover:bg-purple-50 group-hover:text-purple-600 transition-colors">
                                                    <Calendar size={20} />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-bold text-gray-800">
                                                        {paymentDate ? new Date(paymentDate + 'T12:00:00').toLocaleDateString('pt-BR') : 'Selecione'}
                                                    </div>
                                                    <div className="text-[10px] text-gray-400 font-bold uppercase">
                                                        1ª de {installments}
                                                    </div>
                                                </div>
                                            </div>
                                            <input 
                                                type="date"
                                                value={paymentDate}
                                                min={todayStr}
                                                onChange={(e) => setPaymentDate(e.target.value)}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 full-click"
                                            />
                                        </div>
                                    </div>

                                    {(interestRate || 0) > 0 && installments >= (interestStart || 999) && paymentMethod === 'PIX' && (
                                        <div className="mt-1 p-3 bg-orange-50 text-orange-600 rounded-xl text-xs font-medium border border-orange-100 flex items-center gap-2">
                                            <AlertCircle size={14} />
                                            Juros de {interestRate}% aplicado.
                                        </div>
                                    )}
                                </>
                            )}

                            {paymentMethod === 'CARD' && (
                                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center space-y-4">
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Valor Total a Cobrar</p>
                                        <p className="text-3xl font-black text-blue-600 tracking-tight">R$ {finalTotal.toFixed(2).replace('.', ',')}</p>
                                    </div>
                                    <div className="text-xs font-bold text-blue-700 bg-white p-3 rounded-lg border border-blue-100 flex items-center justify-center gap-2">
                                        <ExternalLink size={14} />
                                        ABRIR SISTEMA DE MAQUININHA PARA PAGAMENTO
                                    </div>
                                </div>
                            )}
                        </div>
                        )}
                    </div>
                )}
             </div>

             <div className="flex-none p-4 md:p-6 bg-white border-t border-gray-100 pb-8 md:pb-6">
                <div className="flex justify-between items-center mb-4">
                   <span className="text-sm text-gray-500 font-medium">Total a Pagar</span>
                   <div className="text-right">
                       <span className="text-3xl font-bold text-gray-900 tracking-tight">R$ {finalTotal.toFixed(2).replace('.',',')}</span>
                       {finalTotal > rawTotal && (
                           <div className="text-xs text-orange-500 font-bold">
                               (Original: R$ {rawTotal.toFixed(2).replace('.',',')})
                           </div>
                       )}
                   </div>
                </div>
                
                {renderActionButtons()}
             </div>

          </div>
        </div>
      </div>
    </div>
  );
};
