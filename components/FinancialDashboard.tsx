import React, { useMemo, useState } from 'react';
import { DollarSign, Calendar, TrendingUp, ShoppingBag, Scissors, ArrowUpRight, ArrowDownRight, Zap, X, FileText, User } from 'lucide-react';
import { Sale, Product, Client } from '../types';

interface FinancialDashboardProps {
  sales: Sale[];
  products: Product[];
  clients: Client[];
  storeEnabled?: boolean;
}

interface DetailItem {
  id: string;
  date: string;
  description: string;
  value: number;
  type: 'SERVICE' | 'PRODUCT';
  clientName: string;
}

interface ModalState {
  isOpen: boolean;
  title: string;
  items: DetailItem[];
  total: number;
}

// --- INTERNAL MODAL COMPONENT ---
const FinancialDetailsModal: React.FC<{ 
  isOpen: boolean; 
  onClose: () => void; 
  title: string; 
  items: DetailItem[]; 
  total: number;
}> = ({ isOpen, onClose, title, items, total }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
           <div>
              <h3 className="text-xl font-bold text-gray-800 leading-tight">{title}</h3>
              <p className="text-xs text-gray-500 font-medium mt-1">{items.length} lançamentos encontrados</p>
           </div>
           <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500">
             <X size={24} />
           </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
           {items.length > 0 ? (
             items.map((item, idx) => (
               <div key={`${item.id}-${idx}`} className="flex items-center justify-between p-4 rounded-2xl border border-gray-100 hover:border-purple-200 hover:bg-purple-50/30 transition-all bg-white shadow-sm">
                  <div className="flex items-center gap-3 overflow-hidden flex-1">
                     <div className={`p-2.5 rounded-xl shrink-0 ${item.type === 'SERVICE' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`}>
                        {item.type === 'SERVICE' ? <Scissors size={18} /> : <ShoppingBag size={18} />}
                     </div>
                     <div className="min-w-0">
                        <div className="font-bold text-gray-800 text-sm truncate">{item.description}</div>
                        <div className="flex items-center gap-2 text-[10px] text-purple-500 font-bold uppercase mt-0.5">
                           <User size={10} />
                           {item.clientName}
                        </div>
                        <div className="text-[10px] text-gray-400 font-medium flex items-center gap-1 mt-0.5">
                           <Calendar size={10} />
                           {new Date(item.date + 'T12:00:00').toLocaleDateString('pt-BR')}
                        </div>
                     </div>
                  </div>
                  <div className="text-right whitespace-nowrap pl-2">
                     <div className="font-black text-gray-800">R$ {item.value.toFixed(2).replace('.', ',')}</div>
                     <div className="text-[10px] font-bold uppercase text-gray-400">{item.type === 'SERVICE' ? 'Serviço' : 'Produto'}</div>
                  </div>
               </div>
             ))
           ) : (
             <div className="text-center py-12 text-gray-400">
                <FileText size={48} className="mx-auto mb-2 opacity-20" />
                <p>Nenhum lançamento neste período.</p>
             </div>
           )}
        </div>

        {/* Footer Total */}
        <div className="p-6 bg-gray-50 border-t border-gray-100">
           <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">Total do Período</span>
              <span className="text-2xl font-black text-gray-800">R$ {total.toFixed(2).replace('.', ',')}</span>
           </div>
        </div>
      </div>
    </div>
  );
};


export const FinancialDashboard: React.FC<FinancialDashboardProps> = ({ sales, products, clients, storeEnabled = true }) => {
  const [modalState, setModalState] = useState<ModalState>({
     isOpen: false,
     title: '',
     items: [],
     total: 0
  });

  const metrics = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const prevDate = new Date();
    prevDate.setMonth(prevDate.getMonth() - 1);
    const prevMonth = prevDate.getMonth();
    const prevYear = prevDate.getFullYear();

    const dayOfWeek = now.getDay(); 
    const weekStart = new Date(todayStart);
    weekStart.setDate(todayStart.getDate() - dayOfWeek);

    const stats = {
      today: { total: 0, serviceRevenue: 0, productRevenue: 0, serviceItems: [] as DetailItem[], productItems: [] as DetailItem[] },
      week: { total: 0, serviceRevenue: 0, productRevenue: 0, serviceItems: [] as DetailItem[], productItems: [] as DetailItem[] },
      month: { total: 0, serviceRevenue: 0, productRevenue: 0, serviceItems: [] as DetailItem[], productItems: [] as DetailItem[] },
      previousMonth: { total: 0 }
    };

    sales.forEach(sale => {
      let totalServiceValue = 0;
      let totalProductValue = 0;
      const serviceNames: string[] = [];
      const productNames: string[] = [];
      const client = clients.find(c => c.id === sale.clientId);
      const clientName = client ? (client.nickname || client.name) : 'Cliente';

      sale.items.forEach(item => {
        const prod = products.find(p => p.id === item.productId);
        const itemTotal = item.priceAtSale * item.quantity;
        if (prod) {
          if (prod.type === 'SERVICE') {
            totalServiceValue += itemTotal;
            serviceNames.push(prod.name);
          } else {
            totalProductValue += itemTotal;
            productNames.push(prod.name);
          }
        } else {
             totalProductValue += itemTotal; 
             productNames.push('Item Removido');
        }
      });
      
      const saleTotal = sale.total;
      const serviceRatio = saleTotal > 0 ? totalServiceValue / (totalServiceValue + totalProductValue) : 0;
      const productRatio = saleTotal > 0 ? totalProductValue / (totalServiceValue + totalProductValue) : 0;

      const serviceDesc = serviceNames.length > 0 ? serviceNames.join(', ') : 'Serviços Diversos';
      const productDesc = productNames.length > 0 ? productNames.join(', ') : 'Produtos Diversos';

      sale.installments.forEach(inst => {
          if (inst.status === 'PAID') {
             const payDateStr = inst.paidAt || sale.date;
             const [pYear, pMonth, pDay] = payDateStr.split('-').map(Number);
             const payDate = new Date(pYear, pMonth - 1, pDay);
             
             const isToday = payDate.getTime() === todayStart.getTime();
             const isThisMonth = pMonth - 1 === currentMonth && pYear === currentYear;
             const isPrevMonth = pMonth - 1 === prevMonth && pYear === prevYear;
             const isThisWeek = payDate >= weekStart && payDate <= new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);

             const amount = inst.value;
             const servicePart = amount * serviceRatio;
             const productPart = amount * productRatio;

             const itemBase = { id: `${sale.id}-${inst.number}`, date: payDateStr, clientName };

             if (isToday) {
                 stats.today.total += amount;
                 stats.today.serviceRevenue += servicePart;
                 stats.today.productRevenue += productPart;
                 if(servicePart > 0) stats.today.serviceItems.push({...itemBase, description: serviceDesc, value: servicePart, type: 'SERVICE'});
                 if(productPart > 0) stats.today.productItems.push({...itemBase, description: productDesc, value: productPart, type: 'PRODUCT'});
             }
             if (isThisWeek) {
                 stats.week.total += amount;
                 stats.week.serviceRevenue += servicePart;
                 stats.week.productRevenue += productPart;
                 if(servicePart > 0) stats.week.serviceItems.push({...itemBase, description: serviceDesc, value: servicePart, type: 'SERVICE'});
                 if(productPart > 0) stats.week.productItems.push({...itemBase, description: productDesc, value: productPart, type: 'PRODUCT'});
             }
             if (isThisMonth) {
                 stats.month.total += amount;
                 stats.month.serviceRevenue += servicePart;
                 stats.month.productRevenue += productPart;
                 if(servicePart > 0) stats.month.serviceItems.push({...itemBase, description: serviceDesc, value: servicePart, type: 'SERVICE'});
                 if(productPart > 0) stats.month.productItems.push({...itemBase, description: productDesc, value: productPart, type: 'PRODUCT'});
             }
             if (isPrevMonth) stats.previousMonth.total += amount;
          }
      });
    });
    return stats;
  }, [sales, products, clients]);

  const monthDiff = metrics.month.total - metrics.previousMonth.total;
  const isPositiveGrowth = monthDiff >= 0;
  const growthPercent = metrics.previousMonth.total > 0 
    ? ((monthDiff / metrics.previousMonth.total) * 100).toFixed(1)
    : (metrics.month.total > 0 ? '100' : '0');

  const currentMonthName = new Date().toLocaleDateString('pt-BR', { month: 'long' });
  const capitalizedMonth = currentMonthName.charAt(0).toUpperCase() + currentMonthName.slice(1);
  const prevDate = new Date();
  prevDate.setMonth(prevDate.getMonth() - 1);
  const capitalizedPrevMonth = prevDate.toLocaleDateString('pt-BR', { month: 'long' }).charAt(0).toUpperCase() + prevDate.toLocaleDateString('pt-BR', { month: 'long' }).slice(1);

  const openDetails = (title: string, items: DetailItem[], total: number) => {
      setModalState({ isOpen: true, title, items: items.sort((a,b) => b.value - a.value), total });
  };

  const Card = ({ 
    title, 
    data, 
    icon: Icon, 
    colorClass, 
    bgClass, 
    borderClass 
  }: { 
    title: string, 
    data: { total: number, serviceRevenue: number, productRevenue: number, serviceItems: DetailItem[], productItems: DetailItem[] }, 
    icon: any, 
    colorClass: string, 
    bgClass: string, 
    borderClass: string 
  }) => (
    <div className={`bg-white rounded-3xl p-6 border ${borderClass} shadow-sm hover:shadow-md transition-all relative overflow-hidden group flex flex-col justify-between h-full`}>
       <div className={`absolute -right-6 -top-6 w-32 h-32 rounded-full ${bgClass} opacity-50 group-hover:scale-110 transition-transform`}></div>
       <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
             <div className={`p-3 rounded-xl ${bgClass} ${colorClass}`}>
                <Icon size={24} strokeWidth={2.5} />
             </div>
             <h3 className="font-bold text-gray-500 uppercase tracking-wider text-sm">{title}</h3>
          </div>
          <div className="mb-6">
             <span className={`text-4xl font-black ${colorClass} tracking-tight`}>
                R$ {(storeEnabled ? data.total : data.serviceRevenue).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
             </span>
             <p className="text-xs text-gray-400 font-bold mt-1 uppercase">Faturamento {storeEnabled ? 'Total' : 'em Serviços'}</p>
          </div>
        </div>
        <div className="relative z-10 flex gap-4 pt-4 border-t border-gray-100 mt-auto">
             <div className="flex-1 cursor-pointer hover:bg-gray-50 rounded-lg p-1 -ml-1 transition-colors" onClick={() => openDetails(`Serviços - ${title}`, data.serviceItems, data.serviceRevenue)}>
                <div className="flex items-center gap-1.5 mb-1 text-gray-400 text-[10px] font-bold uppercase"><Scissors size={12} /><span>Serviços</span></div>
                <div className="text-lg font-bold text-gray-800 leading-none group-hover:text-purple-600 transition-colors">R$ {data.serviceRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
             </div>
             {storeEnabled && (
                <>
                    <div className="w-px bg-gray-100"></div>
                    <div className="flex-1 cursor-pointer hover:bg-gray-50 rounded-lg p-1 -mr-1 transition-colors" onClick={() => openDetails(`Loja - ${title}`, data.productItems, data.productRevenue)}>
                        <div className="flex items-center gap-1.5 mb-1 text-gray-400 text-[10px] font-bold uppercase"><ShoppingBag size={12} /><span>Loja</span></div>
                        <div className="text-lg font-bold text-gray-800 leading-none group-hover:text-purple-600 transition-colors">R$ {data.productRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                    </div>
                </>
             )}
        </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto pb-10">
      <FinancialDetailsModal isOpen={modalState.isOpen} onClose={() => setModalState(prev => ({ ...prev, isOpen: false }))} title={modalState.title} items={modalState.items} total={modalState.total} />
      <div className="mb-8"><h2 className="text-3xl font-bold text-gray-900 mb-1">Financeiro</h2><p className="text-gray-400">Visão detalhada do seu faturamento.</p></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card title="Hoje" data={metrics.today} icon={DollarSign} colorClass="text-emerald-600" bgClass="bg-emerald-100" borderClass="border-emerald-100" />
        <Card title="Esta Semana" data={metrics.week} icon={Calendar} colorClass="text-blue-600" bgClass="bg-blue-100" borderClass="border-blue-100" />
        <Card title="Este Mês" data={metrics.month} icon={TrendingUp} colorClass="text-purple-600" bgClass="bg-purple-100" borderClass="border-purple-100" />
      </div>
      <div className="bg-gradient-to-br from-indigo-50 via-white to-purple-50 rounded-3xl p-8 text-gray-800 relative overflow-hidden shadow-sm border border-purple-100">
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                  <div className="inline-flex items-center gap-2 bg-white shadow-sm px-3 py-1 rounded-full border border-purple-100 mb-4"><Zap size={14} className="text-amber-500" fill="currentColor" /><span className="text-xs font-bold uppercase tracking-wider text-purple-900">Análise Mensal</span></div>
                  <h3 className="text-2xl font-bold mb-2 text-gray-900">Resumo Geral</h3>
                  <p className="text-gray-500 text-sm max-w-md leading-relaxed">Comparativo direto entre o faturamento total do mês atual em relação ao fechamento do mês anterior.</p>
              </div>
              <div className="flex flex-col md:flex-row gap-6 md:justify-end">
                  <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm min-w-[140px]">
                      <div className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Mês Anterior • {capitalizedPrevMonth}</div>
                      <div className="text-2xl font-bold text-gray-700">R$ {metrics.previousMonth.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                  </div>
                  <div className={`rounded-2xl p-4 border min-w-[180px] shadow-sm bg-white ${isPositiveGrowth ? 'border-emerald-200 ring-2 ring-emerald-50' : 'border-red-200 ring-2 ring-red-50'}`}>
                      <div className="flex justify-between items-start mb-1"><div className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1 ${isPositiveGrowth ? 'text-emerald-600' : 'text-red-600'}`}>Mês Atual • {capitalizedMonth}</div></div>
                      <div className="text-3xl font-black text-gray-800 mt-1 cursor-pointer hover:text-purple-600 transition-colors" onClick={() => openDetails(`Faturamento Geral - ${capitalizedMonth}`, [...metrics.month.serviceItems, ...metrics.month.productItems], metrics.month.total)} title="Ver detalhes de faturamento">
                          R$ {metrics.month.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                          <div className={`flex items-center text-xs font-black ${isPositiveGrowth ? 'text-emerald-600 bg-emerald-50' : 'text-red-600 bg-red-50'} px-2 py-1 rounded-lg`}>{isPositiveGrowth ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />} {growthPercent}%</div>
                          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Vs Mês Anterior</span>
                      </div>
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
};