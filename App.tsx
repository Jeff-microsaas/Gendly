import React, { useState, useMemo, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Settings, 
  LogOut, 
  Menu,
  Plus,
  Edit,
  Trash2,
  Users,
  CalendarDays,
  Briefcase,
  ShoppingBag,
  DollarSign,
  Heart,
  Phone,
  Cake,
  Package,
  CreditCard,
  Save,
  QrCode,
  Percent,
  ArrowRight,
  Clock,
  Bell,
  Zap,
  Gift,
  MessageCircle,
  AlertTriangle,
  ToggleLeft,
  ToggleRight,
  Scissors,
  Layers,
  Timer,
  History,
  X,
  Trophy,
  Medal,
  Crown,
  Tag,
  Sparkles,
  Building,
  Camera,
  Calendar,
  AlertCircle,
  CheckCircle2,
  User as UserIcon,
  ShieldCheck,
  FileText,
  Lock,
  HelpCircle,
  Bot,
  UserPlus,
  ChevronDown,
  Database
} from 'lucide-react';
import { Product, ViewState, Company, User, Client, Sale, Installment, Appointment, Professional, Specialty, QueueItem, LoyaltyRedemption, Promotion, Category, PlanType, UserPermissions } from './types';
import { 
  db, 
  FULL_PERMISSIONS, 
  EMPTY_PERMISSIONS, 
  INITIAL_COMPANIES, 
  INITIAL_USERS, 
  MOCK_CATEGORIES, 
  MOCK_PRODUCTS, 
  MOCK_CLIENTS, 
  MOCK_SPECIALTIES, 
  MOCK_PROFESSIONALS, 
  MOCK_SALES, 
  INITIAL_APPOINTMENTS, 
  ADMIN_ALANINHA, 
  ADMIN_JEFF 
} from './services/db';
import { DatabaseStatusModal } from './components/DatabaseStatusModal';
import { DashboardHome } from './components/DashboardHome';
import { ProductForm } from './components/ProductForm';
import { ClientForm } from './components/ClientForm';
import { ClientSelector } from './components/ClientSelector';
import { SalesModal } from './components/SalesModal';
import { AppointmentModal } from './components/AppointmentModal';
import { AppointmentAlertModal } from './components/AppointmentAlertModal';
import { InServiceModal } from './components/InServiceModal';
import { ProfessionalForm } from './components/ProfessionalForm';
import { SpecialtyModal } from './components/SpecialtyModal';
import { ProfessionalHistoryModal } from './components/ProfessionalHistoryModal';
import { FinancialDashboard } from './components/FinancialDashboard';
import { CalendarView } from './components/CalendarView';
import { QueueModal } from './components/QueueModal';
import { LoyaltyDashboard } from './components/LoyaltyDashboard';
import { PackageConclusionModal } from './components/PackageConclusionModal';
import { LoyaltyRewardModal } from './components/LoyaltyRewardModal';
import { BirthdayModal } from './components/BirthdayModal';
import { PromotionPage } from './components/PromotionPage';
import { InventoryPage } from './components/InventoryPage';
import { StockConsumptionModal } from './components/StockConsumptionModal';
import { LandingPage } from './components/LandingPage';
import { HelpModal } from './components/HelpModal';
import { AssistantOnboarding } from './components/AssistantOnboarding';

// --- UTILS PARA VALIDAÇÃO E MÁSCARA ---

const validateCPF = (cpf: string) => {
    cpf = cpf.replace(/[^\d]+/g, '');
    if (cpf.length !== 11 || !!cpf.match(/(\d)\1{10}/)) return false;
    let sum = 0, rest;
    for (let i = 1; i <= 9; i++) sum += parseInt(cpf.substring(i - 1, i)) * (11 - i);
    rest = (sum * 10) % 11;
    if ((rest === 10) || (rest === 11)) rest = 0;
    if (rest !== parseInt(cpf.substring(9, 10))) return false;
    sum = 0;
    for (let i = 1; i <= 10; i++) sum += parseInt(cpf.substring(i - 1, i)) * (12 - i);
    rest = (sum * 10) % 11;
    if ((rest === 10) || (rest === 11)) rest = 0;
    return rest === parseInt(cpf.substring(10, 11));
};

const validateCNPJ = (cnpj: string) => {
    cnpj = cnpj.replace(/[^\d]+/g, '');
    if (cnpj.length !== 14 || !!cnpj.match(/(\d)\1{13}/)) return false;
    let size = cnpj.length - 2;
    let numbers = cnpj.substring(0, size);
    let digits = cnpj.substring(size);
    let sum = 0, pos = size - 7;
    for (let i = size; i >= 1; i--) {
        sum += parseInt(numbers.charAt(size - i)) * pos--;
        if (pos < 2) pos = 9;
    }
    let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (result !== parseInt(digits.charAt(0))) return false;
    size = size + 1;
    numbers = cnpj.substring(0, size);
    sum = 0;
    pos = size - 7;
    for (let i = size; i >= 1; i--) {
        sum += parseInt(numbers.charAt(size - i)) * pos--;
        if (pos < 2) pos = 9;
    }
    let resFinal = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    return resFinal === parseInt(digits.charAt(1));
};

const maskCPF = (cpf: string) => {
    cpf = cpf.replace(/\D/g, "");
    if (cpf.length > 11) cpf = cpf.substring(0, 11);
    cpf = cpf.replace(/(\d{3})(\d)/, "$1.$2");
    cpf = cpf.replace(/(\d{3})(\d)/, "$1.$2");
    cpf = cpf.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    return cpf;
};

const maskCNPJ = (cnpj: string) => {
    cnpj = cnpj.replace(/\D/g, "");
    if (cnpj.length > 14) cnpj = cnpj.substring(0, 14);
    cnpj = cnpj.replace(/^(\d{2})(\d)/, "$1.$2");
    cnpj = cnpj.replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3");
    cnpj = cnpj.replace(/\.(\d{3})(\d)/, ".$1/$2");
    cnpj = cnpj.replace(/(\d{4})(\d)/, "$1-$2");
    return cnpj;
};

// --- COMPONENTES INTERNOS ---

const ErrorModal: React.FC<{ title: string; message: string; onClose: () => void }> = ({ title, message, onClose }) => (
    <div className="fixed inset-0 z-[600] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
        <div className="bg-white rounded-[2rem] shadow-2xl w-full max-sm p-8 text-center animate-in zoom-in-95 duration-200 border border-red-100">
            <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
            <p className="text-gray-500 text-sm mb-6 leading-relaxed">{message}</p>
            <button 
                onClick={onClose}
                className="w-full py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-all shadow-lg shadow-red-100"
            >
                Entendi
            </button>
        </div>
    </div>
);

const SuccessOverlay: React.FC<{ message?: string }> = ({ message = "Realizado com Sucesso!" }) => (
    <div className="fixed inset-0 z-[600] flex items-center justify-center bg-black/50 backdrop-blur-sm p-6 animate-in fade-in duration-300">
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

const LimitReachedModal: React.FC<{ title: string; message: string; buttonLabel?: string; onPlans: () => void; onClose: () => void }> = ({ title, message, buttonLabel = "Ver Planos", onPlans, onClose }) => (
    <div className="fixed inset-0 z-[600] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
        <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md p-10 text-center animate-in zoom-in-95 duration-200 border border-purple-100">
            <div className="w-20 h-20 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Zap size={40} fill="currentColor" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-2 leading-tight">{title}</h2>
            <p className="text-gray-500 font-medium mb-10 leading-relaxed">{message}</p>
            <div className="space-y-4">
                <button 
                    onClick={onPlans}
                    className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-purple-200 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                >
                    {buttonLabel}
                </button>
                <button 
                    onClick={onClose}
                    className="w-full py-3 text-gray-400 font-bold text-sm hover:text-gray-600 transition-colors"
                >
                    Continuar depois
                </button>
            </div>
        </div>
    </div>
);

const AlreadyRegisteredModal: React.FC<{ 
  title: string; 
  message: string; 
  daysLeft?: number; 
  onLogin: () => void; 
  onPlans: () => void; 
  onClose: () => void;
}> = ({ title, message, daysLeft, onLogin, onPlans, onClose }) => (
    <div className="fixed inset-0 z-[600] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
        <div className="bg-white rounded-[2rem] shadow-2xl w-full max-sm p-8 text-center animate-in zoom-in-95 duration-200 border border-purple-100">
            <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldCheck size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
            <p className="text-gray-500 text-sm mb-4 leading-relaxed">{message}</p>
            
            {daysLeft !== undefined && daysLeft > 0 && (
                <div className="bg-purple-50 p-4 rounded-2xl mb-6">
                    <p className="text-purple-600 font-black text-sm uppercase tracking-widest">
                        Seu teste expira em {daysLeft} dias
                    </p>
                </div>
            )}

            <div className="space-y-3">
                <button 
                    onClick={onLogin}
                    className="w-full py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-all shadow-lg shadow-purple-100"
                >
                    Acessar minha conta
                </button>
                <button 
                    onClick={onPlans}
                    className="w-full py-3 bg-white border-2 border-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-50 transition-all"
                >
                    Ver Planos
                </button>
                <button 
                    onClick={onClose}
                    className="text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors pt-2"
                >
                    Fechar
                </button>
            </div>
        </div>
    </div>
);

const TrialEndedModal: React.FC<{ onChoosePlan: () => void }> = ({ onChoosePlan }) => (
    <div className="fixed inset-0 z-[600] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-500">
        <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md p-10 text-center animate-in zoom-in-95 duration-500 border border-purple-100">
            <div className="w-20 h-20 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Lock size={40} />
            </div>
            <h2 className="text-3xl font-black text-gray-900 mb-2 leading-tight">Período de testes finalizado</h2>
            <p className="text-gray-500 font-medium mb-10 leading-relaxed">
                Seus 30 dias de teste gratuito expiraram. Para continuar acessando seus dados e turbinando seu negócio, escolha um de nossos planos.
            </p>
            <button 
                onClick={onChoosePlan}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-purple-200 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
            >
                <Sparkles size={24} />
                Ver Planos Disponíveis
            </button>
        </div>
    </div>
);

// --- DADOS E MOCKS INICIAIS GERENCIADOS PELO SERVICES/DB ---

// Tabelas gerenciadas pelo servico central de banco de dados db (services/db.ts)

// Todas as tabelas e dados persistentes sao inicializados e sincronizados centralmente por db em services/db.ts

const ConfirmDeleteModal: React.FC<{ 
  isOpen: boolean; 
  onClose: () => void; 
  onConfirm: () => void; 
  title: string; 
  message: string; 
 }> = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white p-8 rounded-3xl shadow-2xl max-sm w-full text-center animate-in zoom-in duration-200">
        <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Trash2 size={32} />
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
        <p className="text-gray-500 text-sm mb-6">{message}</p>
        <div className="flex gap-4">
          <button onClick={onClose} className="flex-1 py-3 bg-gray-100 rounded-xl font-bold text-gray-600 transition-colors hover:bg-gray-200">Cancelar</button>
          <button onClick={onConfirm} className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold shadow-lg shadow-red-200 transition-all hover:bg-red-600">Excluir</button>
        </div>
      </div>
    </div>
  );
};

const UserFormModal: React.FC<{ 
  isOpen: boolean; 
  onClose: () => void; 
  onSave: (data: Partial<User>) => void; 
  initialData?: User | null; 
}> = ({ isOpen, onClose, onSave, initialData }) => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [permissions, setPermissions] = useState<UserPermissions>(EMPTY_PERMISSIONS);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setUsername(initialData.username);
      setPassword(initialData.password);
      setPermissions(initialData.permissions);
    } else {
      setName('');
      setUsername('');
      setPassword('');
      setPermissions(EMPTY_PERMISSIONS);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const togglePerm = (key: keyof UserPermissions) => {
    setPermissions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleFormSubmit = () => {
    if (!name.trim() || !username.trim() || !password.trim()) {
      alert("Os campos Nome, E-mail e Senha são obrigatórios.");
      return;
    }
    onSave({ 
      id: initialData?.id,
      name, 
      username, 
      password, 
      permissions, 
      role: initialData?.role || 'USER' 
    });
  };

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white">
          <h3 className="text-xl font-bold text-gray-800">{initialData ? 'Editar Usuário' : 'Novo Usuário'}</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400"><X size={24} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Nome Completo *</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-purple-200 transition-all" placeholder="Ex: Maria Clara" required />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">E-mail (Usuário) *</label>
            <input type="email" value={username} onChange={e => setUsername(e.target.value)} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-purple-200 transition-all" placeholder="nome@exemplo.com" required />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Senha Provisória *</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-purple-200 transition-all" placeholder="••••••••" required />
          </div>
          
          <div className="pt-4 border-t border-gray-100">
            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 ml-1">Permissões de Acesso</h4>
            <div className="space-y-2">
              {[
                { key: 'financial', label: 'Financeiro', icon: DollarSign },
                { key: 'stock', label: 'Estoque', icon: Package },
                { key: 'settings', label: 'Ajustes', icon: Settings },
                { key: 'store', label: 'Loja (Vendas)', icon: ShoppingBag },
                { key: 'promotions', label: 'Promoções', icon: Tag },
                { key: 'loyalty', label: 'Fidelidade', icon: Heart },
              ].map((perm) => (
                <div key={perm.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-purple-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg text-gray-400"><perm.icon size={16} /></div>
                    <span className="text-sm font-bold text-gray-700">{perm.label}</span>
                  </div>
                  <button onClick={() => togglePerm(perm.key as keyof UserPermissions)}>
                    {permissions[perm.key as keyof UserPermissions] ? <ToggleRight className="text-purple-600" size={32} /> : <ToggleLeft className="text-gray-300" size={32} />}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="p-6 border-t border-gray-100 bg-gray-50">
          <button 
            onClick={handleFormSubmit}
            className="w-full py-4 bg-purple-600 text-white rounded-2xl font-black shadow-lg shadow-purple-100 hover:bg-purple-700 transition-all uppercase text-sm tracking-widest"
          >
            {initialData ? 'Atualizar Cadastro' : 'Cadastrar Usuário'}
          </button>
        </div>
      </div>
    </div>
  );
};

const ClientHistoryModal: React.FC<{ 
  client: Client | null; 
  isOpen: boolean; 
  onClose: () => void; 
  sales: Sale[]; 
  products: Product[]; 
}> = ({ client, isOpen, onClose, sales, products }) => {
  const history = useMemo(() => {
    if (!client) return [];
    return sales.filter(s => s.clientId === client.id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [client, sales]);

  if (!isOpen || !client) return null;

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden animate-in zoom-in duration-200">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-xl border-2 border-white">
              {client.avatar ? <img src={client.avatar} className="w-full h-full rounded-full object-cover" /> : client.name.charAt(0)}
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">{client.name}</h3>
              <p className="text-sm text-gray-500">Histórico de Atendimentos</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400"><X size={24} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
          {history.length > 0 ? history.map(sale => (
            <div key={sale.id} className="p-5 bg-white border border-gray-100 rounded-2xl shadow-sm hover:border-purple-200 transition-colors">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  <div className="bg-purple-100 p-1.5 rounded-lg text-purple-600">
                    <Calendar size={14} />
                  </div>
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{new Date(sale.date + 'T12:00:00').toLocaleDateString('pt-BR')}</span>
                </div>
                <span className="text-sm font-black text-emerald-600">R$ {sale.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="text-sm text-gray-700 font-medium">
                {sale.items.map(item => {
                  const p = products.find(prod => prod.id === item.productId);
                  return p ? p.name : 'Item Removido';
                }).join(', ')}
              </div>
            </div>
          )) : (
            <div className="text-center py-16 text-gray-400">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                 <History size={32} className="opacity-20" />
              </div>
              <p className="text-sm font-medium">Nenhum atendimento registrado no histórico.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const LoginForm: React.FC<{ 
  users: User[]; 
  companies: Company[];
  onLogin: (u: User) => void; 
  onRegister: (n: string, c: string, u: string, p: string, taxId: string, bType: 'PF' | 'PJ', plan?: PlanType) => void;
  initialMode?: 'login' | 'register';
  selectedPlan?: PlanType;
  onSelectPlans: () => void;
}> = ({ users, companies, onLogin, onRegister, initialMode = 'login', selectedPlan, onSelectPlans }) => {
  const [isRegister, setIsRegister] = useState(initialMode === 'register');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [taxId, setTaxId] = useState('');
  const [businessType, setBusinessType] = useState<'PF' | 'PJ'>('PF');
  const [errorData, setErrorData] = useState<{title: string, message: string} | null>(null);
  const [registryModal, setRegistryModal] = useState<any>(null);

  const handleTaxIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      if (businessType === 'PF') {
          setTaxId(maskCPF(val));
      } else {
          setTaxId(maskCNPJ(val));
      }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isRegister) {
      if (!taxId) {
          setErrorData({ title: 'Campo Obrigatório', message: 'Por favor, informe seu CPF ou CNPJ para prosseguir.' });
          return;
      }
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(username)) {
          setErrorData({ 
              title: 'E-mail Inválido', 
              message: 'O formato do e-mail informado no campo Usuário não é válido. Exemplo correto: nome@exemplo.com' 
          });
          return;
      }

      if (businessType === 'PF' && !validateCPF(taxId)) {
          setErrorData({ 
              title: 'CPF Inválido', 
              message: 'O CPF informado não é válido. Por favor, verifique os números digitados e tente novamente.' 
          });
          return;
      }
      if (businessType === 'PJ' && !validateCNPJ(taxId)) {
          setErrorData({ 
              title: 'CNPJ Inválido', 
              message: 'O CNPJ informado não é válido. Verifique os números, incluindo o final /0001-XX.' 
          });
          return;
      }

      // Verificação de Duplicidade (Checklist histórico de trials)
      const blackList = JSON.parse(localStorage.getItem('gendly_trial_registry') || '[]');
      const existing = blackList.find((item: any) => item.taxId === taxId || item.email === username);
      
      if (existing) {
          const startDate = new Date(existing.trialStartDate);
          const now = new Date();
          const diffMs = now.getTime() - startDate.getTime();
          const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
          const daysLeft = 30 - diffDays;

          if (daysLeft > 0) {
              setRegistryModal({
                  title: 'Cadastro já realizado',
                  message: `Este ${businessType} já possui um período de testes ativo vinculado.`,
                  daysLeft: daysLeft,
                  onLogin: () => setIsRegister(false),
                  onPlans: onSelectPlans
              });
          } else {
              setRegistryModal({
                  title: 'Período de testes expirado',
                  message: 'Este documento já foi utilizado para o período gratuito de 30 dias. Por favor, escolha uma assinatura para continuar.',
                  onLogin: () => setIsRegister(false),
                  onPlans: onSelectPlans
              });
          }
          return;
      }

      onRegister(name, company, username, password, taxId, businessType, selectedPlan);
    } else {
      const cleanUser = username.trim().toLowerCase();
      const cleanPass = password.trim();
      let u = users.find(user => user.username.trim().toLowerCase() === cleanUser && user.password === cleanPass);
      
      // Validação de acesso vitalício para alaninha@gmail.com (Administradora Exclusiva de Studio Alana Moreira)
      if (cleanUser === 'alaninha@gmail.com' && (cleanPass === 'Alaninha@123' || (u && u.password === cleanPass))) {
        u = {
          id: u?.id || 'u-alaninha',
          username: 'alaninha@gmail.com',
          password: 'Alaninha@123',
          name: 'Alana Moreira (Administradora)',
          companyId: 'studio-alana-moreira',
          role: 'ADMIN',
          isMaster: false,
          neverExpires: true,
          permissions: FULL_PERMISSIONS
        };
      } else if (cleanUser === 'jeff@gmail.com' && (cleanPass === '123456' || (u && u.password === cleanPass))) {
        u = {
          id: u?.id || 'u-jeff',
          username: 'jeff@gmail.com',
          password: '123456',
          name: 'Jeff (Administrador Master)',
          companyId: u?.companyId || companies[0]?.id || '1',
          role: 'ADMIN',
          isMaster: true,
          neverExpires: true,
          permissions: FULL_PERMISSIONS
        };
      }

      if (u) {
        onLogin(u);
      } else {
        setErrorData({ title: 'Acesso Negado', message: 'Usuário ou senha incorretos. Verifique suas credenciais e tente novamente.' });
      }
    }
  };

  const getButtonLabel = () => {
    if (!isRegister) return 'Acessar Painel';
    switch (selectedPlan) {
      case 'ESSENTIAL': return 'FINALIZAR CADASTRO (ESSENCIAL)';
      case 'PROFESSIONAL': return 'FINALIZAR CADASTRO (PROFISSIONAL)';
      case 'PREMIUM': return 'FINALIZAR CADASTRO (PREMIUM)';
      default: return 'CRIAR CONTA';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-lilac-50 via-white to-pink-50 flex items-center justify-center p-4">
      {errorData && <ErrorModal title={errorData.title} message={errorData.message} onClose={() => setErrorData(null)} />}
      {registryModal && (
          <AlreadyRegisteredModal 
            title={registryModal.title}
            message={registryModal.message}
            daysLeft={registryModal.daysLeft}
            onLogin={registryModal.onLogin}
            onPlans={registryModal.onPlans}
            onClose={() => setRegistryModal(null)}
          />
      )}

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-pink-200/20 rounded-full blur-3xl -ml-20 -mb-20"></div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white/80 backdrop-blur-md p-10 rounded-[2.5rem] shadow-2xl w-full max-md space-y-8 border border-white/50 relative z-10 animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center space-y-2">
          <h1 className="text-5xl font-black gradient-text tracking-tighter">Gendly</h1>
          <p className="text-gray-500 font-medium">Sua agenda inteligente de beleza</p>
          {isRegister && selectedPlan && (
            <div className="mt-2 inline-block px-3 py-1 bg-purple-100 text-purple-600 rounded-full text-[10px] font-black uppercase tracking-widest">
              Plano Selecionado: {selectedPlan === 'ESSENTIAL' ? 'Essencial' : selectedPlan === 'PROFESSIONAL' ? 'Profissional' : 'Premium'}
            </div>
          )}
        </div>

        <div className="space-y-4">
          {isRegister && (
            <>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Nome Completo</label>
                <input type="text" placeholder="Maria Silva" value={name} onChange={e => setName(e.target.value)} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-purple-200 transition-all outline-none" required />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Nome da Empresa</label>
                <input type="text" placeholder="Studio Beleza" value={company} onChange={e => setCompany(e.target.value)} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-purple-200 transition-all outline-none" required />
              </div>

              <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-2xl">
                  <button 
                    type="button" 
                    onClick={() => { setBusinessType('PF'); setTaxId(''); }}
                    className={`py-2 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all ${businessType === 'PF' ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-400'}`}
                  >
                      Pessoa Física
                  </button>
                  <button 
                    type="button" 
                    onClick={() => { setBusinessType('PJ'); setTaxId(''); }}
                    className={`py-2 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all ${businessType === 'PJ' ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-400'}`}
                  >
                      Pessoa Jurídica
                  </button>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                    {businessType === 'PF' ? 'CPF' : 'CNPJ'}
                </label>
                <div className="relative">
                    <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                    <input 
                        type="text" 
                        placeholder={businessType === 'PF' ? "000.000.000-00" : "000.000.000/0001-00"} 
                        value={taxId} 
                        onChange={handleTaxIdChange} 
                        className="w-full p-4 pl-12 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-purple-200 transition-all outline-none" 
                        required 
                    />
                </div>
              </div>
            </>
          )}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">E-mail (Usuário)</label>
            <input type="email" placeholder="nome@exemplo.com" value={username} onChange={e => setUsername(e.target.value)} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-purple-200 transition-all outline-none" required />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Senha</label>
            <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-purple-200 transition-all outline-none" required />
          </div>
        </div>

        <button type="submit" className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-black shadow-lg shadow-purple-200 hover:shadow-xl hover:scale-102 active:scale-98 transition-all uppercase tracking-widest text-sm">
          {getButtonLabel()}
        </button>

        <div className="pt-4 text-center">
          <button type="button" onClick={() => setIsRegister(!isRegister)} className="text-sm font-bold text-gray-400 hover:text-purple-600 transition-colors">
            {isRegister ? 'Já tenho acesso? ' : 'Ainda não é parceiro? '}
            <span className="text-purple-600 underline">
              {isRegister ? 'Entrar agora' : 'Comece aqui'}
            </span>
          </button>
        </div>
      </form>
    </div>
  );
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('gendly_active_session');
      if (saved) {
        const parsed = JSON.parse(saved) as User;
        if (parsed && parsed.username) {
          const cleanEmail = parsed.username.toLowerCase().trim();
          if (cleanEmail === 'alaninha@gmail.com') {
            return {
              ...parsed,
              name: 'Alana Moreira (Administradora)',
              companyId: 'studio-alana-moreira',
              role: 'ADMIN',
              isMaster: false,
              neverExpires: true,
              permissions: FULL_PERMISSIONS
            };
          } else if (cleanEmail === 'jeff@gmail.com') {
            return {
              ...parsed,
              name: 'Jeff (Administrador Master)',
              role: 'ADMIN',
              isMaster: true,
              neverExpires: true,
              permissions: FULL_PERMISSIONS
            };
          }
          return parsed;
        }
      }
    } catch (e) {
      console.error('Erro ao restaurar sessão ativa:', e);
    }
    return null;
  });

  const [showLandingPage, setShowLandingPage] = useState(() => {
    try {
      return !localStorage.getItem('gendly_active_session');
    } catch {
      return true;
    }
  });
  const [loginInitialMode, setLoginInitialMode] = useState<'login' | 'register'>('login');
  const [selectedPlan, setSelectedPlan] = useState<PlanType | undefined>(undefined);
  const [showTrialEndModal, setShowTrialEndModal] = useState(false);
  const [showUserSuccess, setShowUserSuccess] = useState(false);
  const [limitModalData, setLimitModalData] = useState<{title: string, message: string, buttonLabel?: string} | null>(null);

  const [currentView, setCurrentView] = useState<ViewState>(ViewState.DASHBOARD);
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => typeof window !== 'undefined' ? window.innerWidth >= 768 : true);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  
  // Onboarding Interactive State (Assistant functionality disabled per user request)
  const [showAssistant, setShowAssistant] = useState(false);
  const [onboardingTaskStep, setOnboardingTaskStep] = useState(0); 
  
  const [users, setUsers] = useState<User[]>(() => db.users.getAll());
  const [companies, setCompanies] = useState<Company[]>(() => db.companies.getAll());
  const [allProducts, setAllProducts] = useState<Product[]>(() => db.products.getAll());
  const [allClients, setAllClients] = useState<Client[]>(() => db.clients.getAll());
  const [allSales, setAllSales] = useState<Sale[]>(() => db.sales.getAll());
  const [allCategories, setAllCategories] = useState<Category[]>(() => db.categories.getAll());
  const [appointments, setAppointments] = useState<Appointment[]>(() => db.appointments.getAll());
  const [activePackages, setActivePackages] = useState<any[]>(() => db.packages.getAll());
  const [queue, setQueue] = useState<QueueItem[]>(() => db.queue.getAll());
  const [pendingRedemptions, setPendingRedemptions] = useState<LoyaltyRedemption[]>(() => db.loyaltyRedemptions.getAll());
  const [promotions, setPromotions] = useState<Promotion[]>(() => db.promotions.getAll());
  const [allProfessionals, setAllProfessionals] = useState<Professional[]>(() => db.professionals.getAll());
  const [allSpecialties, setAllSpecialties] = useState<Specialty[]>(() => db.specialties.getAll());
  const [isDbStatusModalOpen, setIsDbStatusModalOpen] = useState(false);

  // Sincronização automática em tempo real com o banco de dados (persistência integral)
  useEffect(() => {
    db.users.setAll(users);
  }, [users]);

  useEffect(() => {
    db.companies.setAll(companies);
  }, [companies]);

  useEffect(() => {
    db.products.setAll(allProducts);
  }, [allProducts]);

  useEffect(() => {
    db.clients.setAll(allClients);
  }, [allClients]);

  useEffect(() => {
    db.sales.setAll(allSales);
  }, [allSales]);

  useEffect(() => {
    db.categories.setAll(allCategories);
  }, [allCategories]);

  useEffect(() => {
    db.appointments.setAll(appointments);
  }, [appointments]);

  useEffect(() => {
    db.packages.setAll(activePackages);
  }, [activePackages]);

  useEffect(() => {
    db.queue.setAll(queue);
  }, [queue]);

  useEffect(() => {
    db.loyaltyRedemptions.setAll(pendingRedemptions);
  }, [pendingRedemptions]);

  useEffect(() => {
    db.promotions.setAll(promotions);
  }, [promotions]);

  useEffect(() => {
    db.professionals.setAll(allProfessionals);
  }, [allProfessionals]);

  useEffect(() => {
    db.specialties.setAll(allSpecialties);
  }, [allSpecialties]);

  // Persistência contínua da sessão ativa do usuário
  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem('gendly_active_session', JSON.stringify(user));
      } else {
        localStorage.removeItem('gendly_active_session');
      }
    } catch (e) {
      console.error('Erro ao sincronizar sessão:', e);
    }
  }, [user]);

  const [reportedProductIds, setReportedProductIds] = useState<string[]>([]);
  
  const [packageConclusionData, setPackageConclusionData] = useState<any | null>(null);

  const [isProfessionalModalOpen, setIsProfessionalModalOpen] = useState(false);
  const [editingProfessional, setEditingProfessional] = useState<Professional | null>(null);
  const [isSpecialtyModalOpen, setIsSpecialtyModalOpen] = useState(false);
  const [historyProfessional, setHistoryProfessional] = useState<Professional | null>(null);

  const [alertAppointment, setAlertAppointment] = useState<Appointment | null>(null);
  const [triggeredAlerts, setTriggeredAlerts] = useState<number[]>([]);
  const [snoozedAlerts, setSnoozedAlerts] = useState<Record<number, number>>({});

  const [currentInServiceApt, setCurrentInServiceApt] = useState<Appointment | null>(null);
  const [isPackagePaymentFlow, setIsPackagePaymentFlow] = useState(false);
  
  const [isQueueModalOpen, setIsQueueModalOpen] = useState(false);
  const [serviceTab, setServiceTab] = useState<'SINGLE' | 'PACKAGE'>('SINGLE');
  
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [historyClient, setHistoryClient] = useState<Client | null>(null);

  const [isStockConsumptionOpen, setIsStockConsumptionOpen] = useState(false);
  const [postStockAction, setPostStockAction] = useState<'FINISH_SERVICE' | 'FINISH_PACKAGE' | 'SCHEDULE_NEXT' | null>(null);

  const [isBirthdayModalOpen, setIsBirthdayModalOpen] = useState(false);
  const [congratulatedIds, setCongratulatedIds] = useState<string[]>([]);

  const [itemToDelete, setItemToDelete] = useState<{ id: string, type: 'CLIENT' | 'PRODUCT' | 'PROFESSIONAL' | 'CATEGORY' | 'COMPANY_USER', name: string } | null>(null);

  const [settingsCompanyName, setSettingsCompanyName] = useState('');
  const [settingsCompanySubName, setSettingsCompanySubName] = useState('');
  const [settingsCompanyLogo, setSettingsCompanyLogo] = useState<string | null>(null);

  // ESTADOS DE CONFIGURAÇÃO (Resetados no logout, carregados no login)
  const [maxInstallments, setMaxInstallments] = useState(12);
  const [pixKey, setPixKey] = useState('');
  const [interestRate, setInterestRate] = useState(0);
  const [interestStart, setInterestStart] = useState(13);
  const [schedulingInterval, setSchedulingInterval] = useState(30);
  const [openingTime, setOpeningTime] = useState('09:00');
  const [closingTime, setClosingTime] = useState('19:00');
  const [appointmentAlertTime, setAppointmentAlertTime] = useState(10);
  const [loyaltyEnabled, setLoyaltyEnabled] = useState(false);
  const [promotionsEnabled, setPromotionsEnabled] = useState(false);
  const [storeEnabled, setStoreEnabled] = useState(false);
  const [stockEnabled, setStockEnabled] = useState(false);
  const [companyUsersEnabled, setCompanyUsersEnabled] = useState(false);
  const [stockWhatsApp, setStockWhatsApp] = useState('');
  const [stockReportDay, setStockReportDay] = useState(1);
  const [loyaltyServiceGoal, setLoyaltyServiceGoal] = useState(10);
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [lowStockAlert, setLowStockAlert] = useState(true);
  const [birthdayAlert, setBirthdayAlert] = useState(true);
  const [lastAutoReportMonth, setLastAutoReportMonth] = useState<number | null>(null);

  const [isClientSelectorOpen, setIsClientSelectorOpen] = useState(false);
  const [clientSelectorMode, setClientSelectorMode] = useState<'SALE' | 'APPOINTMENT'>('SALE');
  
  const [isSalesModalOpen, setIsSalesModalOpen] = useState(false);
  const [saleClient, setSaleClient] = useState<Client | null>(null);
  const [initialCart, setInitialCart] = useState<{product: Product, quantity: number}[]>([]);

  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [appointmentClient, setAppointmentClient] = useState<Client | null>(null);
  const [appointmentPreSelection, setAppointmentPreSelection] = useState<{ date: string, time: string } | undefined>(undefined);
  const [fixedService, setFixedService] = useState<string | null>(null);
  const [isNextSessionMode, setIsNextSessionMode] = useState(false);
  const [isRenewalMode, setIsRenewalMode] = useState(false);
  const [rewardDetails, setRewardDetails] = useState<LoyaltyRedemption | null>(null);

  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // --- LÓGICA DE ISOLAMENTO DE EMPRESA ---

  useEffect(() => {
    if (user) {
        // Carregar configurações específicas da empresa do banco ao logar
        const parsed = db.settings.get(user.companyId);
        if (parsed) {
            setMaxInstallments(parsed.maxInstallments ?? 12);
            setPixKey(parsed.pixKey ?? '');
            setInterestRate(parsed.interestRate ?? 0);
            setInterestStart(parsed.interestStart ?? 13);
            setSchedulingInterval(parsed.schedulingInterval ?? 30);
            setOpeningTime(parsed.openingTime ?? '09:00');
            setClosingTime(parsed.closingTime ?? '19:00');
            setAppointmentAlertTime(parsed.appointmentAlertTime ?? 10);
            setLoyaltyEnabled(parsed.loyaltyEnabled ?? false);
            setPromotionsEnabled(parsed.promotionsEnabled ?? false);
            setStoreEnabled(parsed.storeEnabled ?? false);
            setStockEnabled(parsed.stockEnabled ?? false);
            setCompanyUsersEnabled(parsed.companyUsersEnabled ?? false);
            setStockWhatsApp(parsed.stockWhatsApp ?? '');
            setStockReportDay(parsed.stockReportDay ?? 1);
            setLoyaltyServiceGoal(parsed.loyaltyServiceGoal ?? 10);
            setReminderEnabled(parsed.reminderEnabled ?? true);
            setLowStockAlert(parsed.lowStockAlert ?? true);
            setBirthdayAlert(parsed.birthdayAlert ?? true);
        }

        const autoReportKey = `gendly_last_auto_report_${user.companyId}`;
        const savedReport = localStorage.getItem(autoReportKey);
        setLastAutoReportMonth(savedReport ? parseInt(savedReport) : null);

        // Assistant logic disabled - showAssistant forced to false
        setShowAssistant(false);
    } else {
        // Resetar para padrões ao deslogar
        setMaxInstallments(12);
        setPixKey('');
        setInterestRate(0);
        setInterestStart(13);
        setSchedulingInterval(30);
        setOpeningTime('09:00');
        setClosingTime('19:00');
        setAppointmentAlertTime(10);
        setLoyaltyEnabled(false);
        setPromotionsEnabled(false);
        setStoreEnabled(false);
        setStockEnabled(false);
        setCompanyUsersEnabled(false);
        setStockWhatsApp('');
        setStockReportDay(1);
        setLoyaltyServiceGoal(10);
        setReminderEnabled(true);
        setLowStockAlert(true);
        setBirthdayAlert(true);
        setShowAssistant(false);
    }
  }, [user]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) setIsSidebarOpen(false);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const currentCompany = useMemo(() => {
    if (!user) return null;
    if (user.username.toLowerCase().trim() === 'alaninha@gmail.com') {
      return companies.find(c => c.id === 'studio-alana-moreira') || companies[0] || null;
    }
    return companies.find(c => c.id === user.companyId) || companies[0] || null;
  }, [user, companies]);

  // Apenas Jeff é Administrador Master Global com permissão de alternar empresas
  const isMasterAdmin = useMemo(() => {
    const cleanUser = user?.username?.toLowerCase().trim();
    return cleanUser === 'jeff@gmail.com' || (!!user?.isMaster && cleanUser !== 'alaninha@gmail.com');
  }, [user]);

  // Alana Moreira e Jeff possuem acesso vitalício permanente sem expiração de plano
  const isLifetimeUser = useMemo(() => {
    const cleanUser = user?.username?.toLowerCase().trim();
    return cleanUser === 'alaninha@gmail.com' || cleanUser === 'jeff@gmail.com' || !!user?.neverExpires || !!user?.isMaster || !!currentCompany?.neverExpires;
  }, [user, currentCompany]);

  useEffect(() => {
      // Usuários com acesso vitalício nunca devem ter acesso expirado
      if (isLifetimeUser) {
          setShowTrialEndModal(false);
          return;
      }
      if (currentCompany && currentCompany.trialStartDate && !currentCompany.neverExpires) {
          const start = new Date(currentCompany.trialStartDate);
          const now = new Date();
          const diffMs = now.getTime() - start.getTime();
          const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
          
          if (diffDays > 30) {
              setShowTrialEndModal(true);
          }
      }
  }, [currentCompany, isLifetimeUser]);

  const isTrialUser = useMemo(() => {
    if (isLifetimeUser) return false;
    return !!currentCompany?.trialStartDate && !currentCompany?.neverExpires;
  }, [currentCompany, isLifetimeUser]);

  useEffect(() => {
    if (currentCompany) {
        setSettingsCompanyName(currentCompany.name);
        setSettingsCompanySubName(currentCompany.subName || '');
        setSettingsCompanyLogo(currentCompany.logo);
    }
  }, [currentCompany]);

  useEffect(() => {
    const checkAlerts = () => {
        if (!user) return;
        const now = new Date();
        const todayStr = new Date().toLocaleDateString('en-CA');

        const confirmedAppointments = appointments.filter(apt => 
            apt.companyId === user.companyId && 
            apt.status === 'Confirmado' && 
            apt.rawDate === todayStr
        );

        confirmedAppointments.forEach(apt => {
             if (snoozedAlerts[apt.id] && now.getTime() < snoozedAlerts[apt.id]) {
                 return;
             }

             const [hours, minutes] = apt.time.split(':').map(Number);
             const aptDate = new Date();
             aptDate.setHours(hours, minutes, 0, 0);

             const diffMs = aptDate.getTime() - now.getTime();
             const diffMins = diffMs / 60000;

             if (diffMins > 0 && diffMins <= appointmentAlertTime) {
                 if (!triggeredAlerts.includes(apt.id)) {
                     setAlertAppointment(apt);
                     setTriggeredAlerts(prev => [...prev, apt.id]);
                 }
             }
        });
    };

    const intervalId = setInterval(checkAlerts, 30000);
    checkAlerts();
    return () => clearInterval(intervalId);
  }, [appointments, appointmentAlertTime, triggeredAlerts, snoozedAlerts, user]);

  const companyProducts = useMemo(() => user ? allProducts.filter(p => p.companyId === user.companyId) : [], [user, allProducts]);
  const companySales = useMemo(() => user ? allSales.filter(s => s.companyId === user.companyId) : [], [user, allSales]);
  const companyCategories = useMemo(() => user ? allCategories.filter(c => c.companyId === user.companyId) : [], [user, allCategories]);
  const companyClients = useMemo(() => user ? allClients.filter(c => c.companyId === user.companyId) : [], [user, allClients]);
  const companyProfessionals = useMemo(() => user ? allProfessionals.filter(p => p.companyId === user.companyId) : [], [user, allProfessionals]);
  const companySpecialties = useMemo(() => user ? allSpecialties.filter(s => s.id !== '' && s.companyId === user.companyId) : [], [user, allSpecialties]);
  const companyAppointments = useMemo(() => user ? appointments.filter(a => a.companyId === user.companyId) : [], [user, appointments]);
  const companyActivePackages = useMemo(() => user ? activePackages.filter(p => p.companyId === user.companyId) : [], [user, activePackages]);
  const companyQueue = useMemo(() => user ? queue.filter(q => q.companyId === user.companyId) : [], [user, queue]);
  const companyPendingRedemptions = useMemo(() => user ? pendingRedemptions.filter(r => r.companyId === user.companyId) : [], [user, pendingRedemptions]);
  const companyPromotions = useMemo(() => user ? promotions.filter(p => p.companyId === user.companyId) : [], [user, promotions]);
  const companyUsers = useMemo(() => {
    if (!user) return [];
    const cleanUser = user.username.toLowerCase().trim();
    const isCurrentUserMaster = cleanUser === 'jeff@gmail.com' || cleanUser === 'alaninha@gmail.com' || !!user.isMaster;
    return users.filter(u => {
      const uEmail = u.username.toLowerCase().trim();
      return u.companyId === user.companyId || (isCurrentUserMaster && (uEmail === 'jeff@gmail.com' || uEmail === 'alaninha@gmail.com'));
    });
  }, [user, users]);

  const companyServices = useMemo(() => companyProducts.filter(p => p.type === 'SERVICE'), [companyProducts]);
  const singleServices = useMemo(() => companyServices.filter(p => p.subtype !== 'PACKAGE'), [companyServices]);
  const packages = useMemo(() => companyServices.filter(p => p.subtype === 'PACKAGE'), [companyServices]);
  
  const companyStoreItems = useMemo(() => companyProducts.filter(p => p.type === 'PRODUCT' && p.purpose === 'SALE'), [companyProducts]);
  const companyInventoryItems = useMemo(() => companyProducts.filter(p => p.type === 'PRODUCT' && p.purpose === 'STOCK'), [companyProducts]);

  const birthdayClients = useMemo(() => {
    const today = new Date();
    const todayMonthDay = `${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    return companyClients.filter(c => c.birthday.endsWith(todayMonthDay));
  }, [companyClients]);

  const handleTalkToConsultant = () => {
      const msg = "Olá! Gostaria de saber mais sobre o plano personalizado para grandes volumes da Gendly.";
      window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const goToPlans = () => {
      setLimitModalData(null);
      setShowTrialEndModal(false);
      if (!user) {
          setShowLandingPage(true);
          setTimeout(() => document.getElementById('planos')?.scrollIntoView({ behavior: 'smooth' }), 100);
      } else if (currentCompany?.plan === 'PREMIUM') {
          handleTalkToConsultant();
      } else {
          setCurrentView(ViewState.DASHBOARD);
      }
  };

  const handleLogin = (u: User) => { 
    const cleanEmail = u.username.toLowerCase().trim();
    let finalUser: User;

    if (cleanEmail === 'alaninha@gmail.com') {
      finalUser = {
        ...u,
        name: 'Alana Moreira (Administradora)',
        companyId: 'studio-alana-moreira',
        role: 'ADMIN',
        isMaster: false, // EXCLUSIVA de Studio Alana Moreira, NÃO NAVEGA em outras empresas
        neverExpires: true, // VITALÍCIO
        permissions: FULL_PERMISSIONS // TODOS OS RECURSOS DO SISTEMA
      };
    } else if (cleanEmail === 'jeff@gmail.com') {
      finalUser = {
        ...u,
        name: 'Jeff (Administrador Master)',
        role: 'ADMIN',
        isMaster: true,
        neverExpires: true,
        permissions: FULL_PERMISSIONS
      };
    } else if (u.neverExpires || u.isMaster) {
      finalUser = {
        ...u,
        role: 'ADMIN',
        neverExpires: true,
        permissions: FULL_PERMISSIONS
      };
    } else {
      finalUser = u;
    }

    setUser(finalUser); 
    try {
      localStorage.setItem('gendly_active_session', JSON.stringify(finalUser));
    } catch(e) {}
    setShowTrialEndModal(false);
    setShowLandingPage(false);
    setCurrentView(ViewState.DASHBOARD); 
  };
  
  const handleRegister = (name: string, company: string, username: string, pass: string, taxId: string, bType: 'PF' | 'PJ', plan: PlanType = 'PROFESSIONAL') => {
    const newCompanyId = Date.now().toString();
    const startDate = new Date().toISOString();
    
    const newC: Company = { 
        id: newCompanyId, 
        name: company, 
        logo: `https://ui-avatars.com/api/?name=${company}`,
        taxId,
        businessType: bType,
        plan,
        trialStartDate: startDate
    };
    
    const newU: User = { 
        id: Date.now().toString(), 
        username, 
        password: pass, 
        name, 
        companyId: newCompanyId, 
        role: 'ADMIN', 
        permissions: FULL_PERMISSIONS 
    };
    
    setCompanies(p => [...p, newC]); 
    setUsers(p => [...p, newU]); 

    // PERSISTÊNCIA INICIAL DE CONFIGURAÇÕES BASEADA ON O PLANO
    let initialSettings: any = {
        maxInstallments, 
        pixKey, 
        interestRate, 
        interestStart, 
        schedulingInterval,
        openingTime,
        closingTime,
        appointmentAlertTime,
        reminderEnabled,
        lowStockAlert,
        birthdayAlert,
        stockWhatsApp,
        stockReportDay,
        companyUsersEnabled: false
    };

    if (plan === 'PROFESSIONAL' || plan === 'PREMIUM') {
        initialSettings = {
            ...initialSettings,
            stockEnabled: true,
            promotionsEnabled: true,
            storeEnabled: true,
            loyaltyEnabled: true,
            loyaltyServiceGoal
        };
    } else if (plan === 'ESSENTIAL') {
        initialSettings = {
            ...initialSettings,
            stockEnabled: true,
            promotionsEnabled: false,
            storeEnabled: false,
            loyaltyEnabled: false
        };
    }

    db.settings.set(newCompanyId, initialSettings);
    db.trialRegistry.add({ taxId, email: username, trialStartDate: startDate });
    
    setUser(newU);
    setShowLandingPage(false);
  };

  const handleAssistantCompleteSettings = (data: any) => {
    if (!user) return;
    
    setOpeningTime(data.openingTime);
    setClosingTime(data.closingTime);
    setSchedulingInterval(data.schedulingInterval);
    setAppointmentAlertTime(data.appointmentAlertTime);
    setPixKey(data.pixKey);
    setMaxInstallments(data.maxInstallments);
    setInterestRate(data.interestRate);
    setInterestStart(data.interestStart);
    
    const companySettingsKey = `gendly_settings_${user.companyId}`;
    const settings = JSON.parse(localStorage.getItem(companySettingsKey) || '{}');
    const updated = { ...settings, ...data };
    localStorage.setItem(companySettingsKey, JSON.stringify(updated));
  };

  const handleAssistantTaskTrigger = (task: 'CLIENT' | 'SERVICE' | 'SPECIALTY' | 'PROFESSIONAL' | 'STORE_PRODUCT') => {
      switch(task) {
          case 'CLIENT': setIsClientModalOpen(true); break;
          case 'SERVICE': setEditingProduct(null); setIsProductModalOpen(true); break;
          case 'SPECIALTY': setIsSpecialtyModalOpen(true); break;
          case 'PROFESSIONAL': setEditingProfessional(null); setIsProfessionalModalOpen(true); break;
          case 'STORE_PRODUCT': setEditingProduct(null); setIsProductModalOpen(true); break;
      }
  };

  const handleStartFromLanding = (mode: 'login' | 'register', plan?: PlanType) => {
    setLoginInitialMode(mode);
    setSelectedPlan(plan);
    setShowLandingPage(false);
  };

  const handleSaveSettings = () => {
    if (!user) return;
    try {
      if (currentCompany) {
          setCompanies(prev => prev.map(c => 
              c.id === currentCompany.id 
              ? { ...c, name: settingsCompanyName, subName: settingsCompanySubName, logo: settingsCompanyLogo || c.logo }
              : c
          ));
      }

      const settings = { 
        maxInstallments, 
        pixKey, 
        interestRate, 
        interestStart, 
        schedulingInterval,
        openingTime,
        closingTime,
        appointmentAlertTime,
        loyaltyEnabled,
        loyaltyServiceGoal,
        reminderEnabled,
        lowStockAlert,
        birthdayAlert,
        promotionsEnabled,
        storeEnabled,
        stockEnabled,
        companyUsersEnabled,
        stockWhatsApp,
        stockReportDay
      };
      db.settings.set(user.companyId, settings);
      setCurrentView(ViewState.DASHBOARD);
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSettingsCompanyLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const confirmAndExecuteDelete = () => {
    if (!itemToDelete) return;
    
    if (itemToDelete.type === 'CLIENT') {
      setAllClients(prev => prev.filter(c => String(c.id) !== String(itemToDelete.id)));
    } else if (itemToDelete.type === 'PRODUCT') {
      setAllProducts(prev => prev.filter(p => String(p.id) !== String(itemToDelete.id)));
    } else if (itemToDelete.type === 'PROFESSIONAL') {
      setAllProfessionals(prev => prev.filter(p => String(p.id) !== String(itemToDelete.id)));
    } else if (itemToDelete.type === 'CATEGORY') {
      setAllCategories(prev => prev.filter(c => String(c.id) !== String(itemToDelete.id)));
    } else if (itemToDelete.type === 'COMPANY_USER') {
      const targetUser = users.find(u => u.id === itemToDelete.id);
      const isTargetMaster = targetUser && (
        targetUser.username.toLowerCase().trim() === 'jeff@gmail.com' ||
        targetUser.username.toLowerCase().trim() === 'alaninha@gmail.com' ||
        targetUser.isMaster ||
        targetUser.neverExpires
      );
      if (isTargetMaster) {
        alert('O Administrador Master vitalício (sem expiração) não pode ser excluído.');
        setItemToDelete(null);
        return;
      }
      setUsers(prev => prev.filter(u => u.id !== itemToDelete.id));
    }

    setItemToDelete(null);
  };

  const handleSaveProduct = (pData: Omit<Product, 'id'> | Product) => {
    if (!user || !currentCompany) return;
    
    // Verificação de Limites (O Administrador Master não possui limites operacionais)
    if (!isMasterAdmin && currentCompany.plan === 'ESSENTIAL' && !('id' in pData)) {
      if (pData.type === 'SERVICE') {
        if (pData.subtype === 'PACKAGE' && packages.length >= 5) {
          setLimitModalData({ title: 'Limite de Pacotes', message: 'Você atingiu o limite de 5 pacotes no plano Essencial. Escolha um plano superior para cadastrar mais.' });
          return;
        }
        if (pData.subtype !== 'PACKAGE' && singleServices.length >= 5) {
          setLimitModalData({ title: 'Limite de Serviços', message: 'Você atingiu o limite de 5 serviços avulsos no plano Essencial. Escolha um plano superior para cadastrar mais.' });
          return;
        }
      } else if (pData.type === 'PRODUCT') {
        if (companyInventoryItems.length >= 5) {
          setLimitModalData({ title: 'Limite de Estoque', message: 'Você atingiu o limite de 5 produtos no estoque no plano Essencial. Escolha um plano superior para gerenciar mais itens.' });
          return;
        }
      }
    }

    if (!isMasterAdmin && currentCompany.plan === 'PROFESSIONAL' && !('id' in pData)) {
        if (pData.type === 'PRODUCT' && pData.purpose === 'SALE' && companyStoreItems.length >= 3) {
            setLimitModalData({ title: 'Limite da Loja', message: 'No plano Profissional você pode cadastrar até 3 produtos para venda. Assine o plano Premium para produtos ilimitados.' });
            return;
        }
    }

    if (!isMasterAdmin && currentCompany.plan === 'PREMIUM' && !('id' in pData)) {
        if (pData.type === 'PRODUCT' && pData.purpose === 'SALE' && companyStoreItems.length >= 10) {
            setLimitModalData({ title: 'Limite da Loja', message: 'No plano Premium você atingiu o limite de 10 produtos para venda. Entre em contato com nosso consultor para suporte personalizado.', buttonLabel: 'Falar com Consultor' });
            return;
        }
    }

    let finalPurpose = pData.purpose;
    if (!finalPurpose && pData.type === 'PRODUCT') {
        finalPurpose = currentView === ViewState.STORE ? 'SALE' : 'STOCK';
    }

    if ('id' in pData) {
      setAllProducts(prev => prev.map(p => p.id === pData.id ? { ...pData, purpose: finalPurpose || p.purpose, companyId: user.companyId } as Product : p));
    } else {
      setAllProducts(prev => [{ ...pData, purpose: finalPurpose, id: Date.now().toString(), companyId: user.companyId } as Product, ...prev]);
    }
  };

  const handleUpdateProductQuantity = (productId: string, newQuantity: number) => {
    setAllProducts(prev => prev.map(p => p.id === productId ? { ...p, quantity: newQuantity } : p));
  };

  const handleReplenishStock = (productId: string, amount: number) => {
    setAllProducts(prev => prev.map(p => p.id === productId ? { ...p, quantity: p.quantity + amount } : p));
  };

  const handleSaveClient = (cData: Omit<Client, 'id'> | Client) => {
    if (!user || !currentCompany) return;
    
    if (currentCompany.plan === 'ESSENTIAL' && !('id' in cData)) {
      if (companyClients.length >= 30) {
        setLimitModalData({ title: 'Limite de Clientes', message: 'Você atingiu o limite de 30 clientes no plano Essencial. Assine um plano superior para expandir sua base.' });
        return;
      }
    }
    if (currentCompany.plan === 'PROFESSIONAL' && !('id' in cData)) {
        if (companyClients.length >= 100) {
            setLimitModalData({ title: 'Limite de Clientes', message: 'Você atingiu o limite de 100 clientes no plano Profissional. Assine o plano Premium para clientes ilimitados.' });
            return;
        }
    }
    if (currentCompany.plan === 'PREMIUM' && !('id' in cData)) {
        if (companyClients.length >= 500) {
            setLimitModalData({ title: 'Limite de Clientes', message: 'No plano Premium você atingiu o limite de 500 clientes. Entre em contato com nosso consultor para um plano personalizado.', buttonLabel: 'Falar com Consultor' });
            return;
        }
    }

    if ('id' in cData) {
      setAllClients(prev => prev.map(c => c.id === cData.id ? { ...cData, companyId: user.companyId } as Client : c));
    } else {
      setAllClients(prev => [{ ...cData, id: Date.now().toString(), companyId: user.companyId } as Client, ...prev]);
    }
  };

  const handleSaveProfessional = (pData: Omit<Professional, 'id'> | Professional) => {
    if (!user || !currentCompany) return;

    if (currentCompany.plan === 'ESSENTIAL' && !('id' in pData)) {
      if (companyProfessionals.length >= 1) {
        setLimitModalData({ title: 'Limite de Profissionais', message: 'No plano Essencial você pode cadastrar apenas 1 profissional. Escolha um plano superior para adicionar equipe.' });
        return;
      }
    }
    if (currentCompany.plan === 'PROFESSIONAL' && !('id' in pData)) {
        if (companyProfessionals.length >= 3) {
            setLimitModalData({ title: 'Limite de Profissionais', message: 'No plano Profissional você pode cadastrar até 3 profissionais. Escolha o plano Premium para equipe ilimitada.' });
            return;
        }
    }
    if (currentCompany.plan === 'PREMIUM' && !('id' in pData)) {
        if (companyProfessionals.length >= 10) {
            setLimitModalData({ title: 'Limite de Profissionais', message: 'No plano Premium você atingiu o limite de 10 profissionais. Entre em contato com nosso consultor para planos personalizados.', buttonLabel: 'Falar com Consultor' });
            return;
        }
    }

    if ('id' in pData) {
      setAllProfessionals(prev => prev.map(p => p.id === pData.id ? { ...pData, companyId: user.companyId } as Professional : p));
    } else {
      setAllProfessionals(prev => [{ ...pData, id: Date.now().toString(), companyId: user.companyId } as Professional, ...prev]);
    }
  };

  const handleAddSpecialty = (name: string) => {
    if (!user) return;
    const newSpec: Specialty = {
        id: Date.now().toString(),
        name,
        companyId: user.companyId
    };
    setAllSpecialties(prev => [...prev, newSpec]);
  };
  
  const handleDeleteSpecialty = (id: string) => {
    setAllSpecialties(prev => prev.filter(s => s.id !== id));
  };

  const handleSaveCategory = (cData: Omit<Category, 'id'> | Category) => {
    if (!user) return;
    if ('id' in cData) {
      setAllCategories(prev => prev.map(cat => cat.id === cData.id ? { ...cData, companyId: user.companyId } as Category : cat));
    } else {
      setAllCategories(prev => [{ ...cData, id: Date.now().toString(), companyId: user.companyId } as Category, ...prev]);
    }
  };

  const handleClientSelect = (client: Client) => {
    if (clientSelectorMode === 'SALE') {
        setSaleClient(client);
        setInitialCart([]);
        setIsClientSelectorOpen(false);
        setTimeout(() => setIsSalesModalOpen(true), 200); 
    } else {
        setAppointmentClient(client);
        setIsClientSelectorOpen(false);
        setFixedService(null);
        setIsNextSessionMode(false);
        setIsRenewalMode(false);
        setTimeout(() => setIsAppointmentModalOpen(true), 200);
    }
  };

  const handleCalendarSlotClick = (date: string, time: string) => {
      setAppointmentPreSelection({ date, time });
      setClientSelectorMode('APPOINTMENT');
      setIsClientSelectorOpen(true);
  };

  const handleFinishSale = (items: { product: Product; quantity: number }[], total: number, paymentDetails: any) => {
    if (!user || !saleClient) return;

    const newProducts = [...allProducts];
    items.forEach(item => {
      const idx = newProducts.findIndex(p => p.id === item.product.id);
      if (idx >= 0 && newProducts[idx].type === 'PRODUCT') {
         newProducts[idx] = {
           ...newProducts[idx],
           quantity: Math.max(0, newProducts[idx].quantity - item.quantity)
         };
      }
    });
    setAllProducts(newProducts);

    const generatedInstallments: Installment[] = [];
    const count = paymentDetails.installments || 1;
    const startDate = new Date(paymentDetails.date || new Date());
    const explicitStatus = paymentDetails.status || 'PENDING';
    const valuePerInst = total / count;

    for (let i = 0; i < count; i++) {
      const d = new Date(startDate);
      d.setMonth(d.getMonth() + i);
      const dateStr = d.toISOString().split('T')[0];
      generatedInstallments.push({
        number: i + 1,
        value: valuePerInst,
        dueDate: dateStr,
        status: explicitStatus as any,
        paidAt: explicitStatus === 'PAID' ? (paymentDetails.date || new Date().toISOString().split('T')[0]) : undefined
      });
    }

    let linkedPackageId: number | undefined = undefined;
    const firstItem = items[0]?.product;
    
    if (firstItem && (firstItem.subtype === 'PACKAGE' || (firstItem.sku === 'TEMP' && firstItem.description === 'Pacote Promocional'))) {
        const pkg = companyActivePackages.find(p => p.client === saleClient.name && p.service === firstItem.name);
        if (pkg) {
            linkedPackageId = pkg.id;
            setActivePackages(prev => prev.map(p => 
                p.id === pkg.id 
                ? { 
                    ...p, 
                    paymentStatus: explicitStatus,
                    dueDate: generatedInstallments[0]?.dueDate
                  } 
                : p
            ));
        }
    }

    const newSale: Sale = {
      id: Date.now().toString(),
      clientId: saleClient.id,
      companyId: user.companyId,
      date: new Date().toISOString().split('T')[0],
      total: total,
      paymentType: paymentDetails.type,
      items: items.map(i => ({ productId: i.product.id, quantity: i.quantity, priceAtSale: i.product.price })),
      installments: generatedInstallments,
      packageId: linkedPackageId
    };

    setAllSales(prev => [newSale, ...prev]);
    setIsSalesModalOpen(false);
    setSaleClient(null);

    if (!isPackagePaymentFlow) {
        setCurrentView(ViewState.DASHBOARD);
    } else {
        setIsPackagePaymentFlow(false);
    }
  };

  const handleConfirmAppointment = (id: number) => {
    const updated = appointments.map(apt => 
      apt.id === id ? { ...apt, status: 'Confirmado', canRemind: false } : apt
    );
    setAppointments(updated);
  };

  const handleStartAppointment = (id: number) => {
     if (!user) return;
     setAppointments(prev => prev.map(apt => 
        apt.id === id ? { ...apt, status: 'Em Andamento' } : apt
     ));

     const apt = appointments.find(a => a.id === id);
     if (apt && apt.category && apt.category.toUpperCase().includes('PACOTE')) {
         setActivePackages(prev => {
             const existingIdx = prev.findIndex(p => p.client === apt.client && p.service === apt.service && p.companyId === user.companyId);
             if (existingIdx >= 0) {
                 const newPkgs = [...prev];
                 const current = newPkgs[existingIdx].current;
                 const total = newPkgs[existingIdx].total;
                 if (current < total) {
                      newPkgs[existingIdx] = {
                          ...newPkgs[existingIdx],
                          current: current + 1,
                          status: 'IN_PROGRESS',
                          next: 'Em Atendimento...'
                      };
                 }
                 return newPkgs;
             }
             const serviceDef = companyServices.find(s => s.name === apt.service);
             return [...prev, {
                  id: Date.now() + Math.random(),
                  companyId: user.companyId, 
                  client: apt.client,
                  avatar: apt.avatar,
                  service: apt.service,
                  current: 1,
                  total: serviceDef?.sessionCount || 10,
                  next: 'Em Atendimento...',
                  status: 'IN_PROGRESS',
                  paymentStatus: 'NONE'
             }];
         });
     }
  };

  const handleFinishSession = (packageId: number) => {
     const pkg = activePackages.find(p => p.id === packageId);
     if (!pkg) return;
     if (pkg.current >= pkg.total) {
        setPackageConclusionData(pkg);
     } else {
         setActivePackages(prev => prev.map(p => 
            p.id === packageId ? { ...p, status: 'ACTIVE', next: 'Agendar' } : p
         ));
     }
  };

  const handleRenewPackage = () => {
      if (!packageConclusionData || !user) return;
      const targetId = packageConclusionData.id;
      setActivePackages(prev => prev.map(p => 
          p.id === targetId
          ? { 
              ...p, 
              id: Date.now() + Math.random(),
              companyId: user.companyId,
              current: 0, 
              status: 'ACTIVE', 
              next: 'Novo Ciclo', 
              paymentStatus: 'NONE',
              dueDate: undefined 
            } 
          : p
      ));
      setPackageConclusionData(null);
      setCurrentView(ViewState.DASHBOARD);
  };

  const handleEndPackage = () => {
      if (!packageConclusionData) return;
      setActivePackages(prev => prev.filter(p => p.id !== packageConclusionData.id));
      setPackageConclusionData(null);
      setCurrentView(ViewState.DASHBOARD);
  };

  const handleSaveAppointment = (data: { date: string; time: string; service: string; professional: string; category: string }) => {
      if (!appointmentClient || !user || !currentCompany) return;
      
      if (currentCompany.plan === 'ESSENTIAL') {
        const [year, month] = data.date.split('-');
        const monthCount = companyAppointments.filter(apt => apt.rawDate.startsWith(`${year}-${month}`)).length;
        if (monthCount >= 60) {
          setLimitModalData({ title: 'Limite de Agendamentos', message: 'Você atingiu o limite de 60 agendamentos mensais no plano Essencial. Assine um plano superior para continuar escalando.' });
          return;
        }
      }
      
      const dateObj = new Date(data.date + 'T12:00:00');
      const displayDate = dateObj.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' }).replace('.', '');
      const weekday = dateObj.toLocaleDateString('pt-BR', { weekday: 'long' }).split('-')[0].toUpperCase();

      const newApt: Appointment = {
          id: Date.now(),
          companyId: user.companyId, 
          time: data.time,
          rawDate: data.date,
          date: displayDate,
          weekday: weekday,
          client: appointmentClient.name,
          clientNickname: appointmentClient.nickname,
          avatar: appointmentClient.avatar || '',
          professional: data.professional,
          professionalAvatar: `https://ui-avatars.com/api/?name=${data.professional}&background=random`,
          service: data.service,
          category: data.category,
          status: rewardDetails ? 'Confirmado' : 'Agendado',
          canRemind: true,
          isReward: !!rewardDetails
      };

      if (rewardDetails) {
          newApt.discountApplied = rewardDetails.discountPercent === 100 ? rewardDetails.originalPrice : (rewardDetails.originalPrice * rewardDetails.discountPercent) / 100;
          setPendingRedemptions(prev => prev.filter(r => r.id !== rewardDetails.id));
      }

      if (isNextSessionMode && currentInServiceApt) {
          const pkg = companyActivePackages.find(p => p.client === currentInServiceApt.client && p.service === currentInServiceApt.service);
          if (pkg) handleFinishSession(pkg.id);
          setCurrentInServiceApt(null);
      } else if (isRenewalMode && currentInServiceApt) {
          const pkg = companyActivePackages.find(p => p.client === currentInServiceApt.client && p.service === currentInServiceApt.service);
          if (pkg) {
               setActivePackages(prev => prev.map(p => 
                  p.id === pkg.id 
                  ? { ...p, id: Date.now() + Math.random(), current: 0, status: 'ACTIVE', next: 'Novo Ciclo', paymentStatus: 'NONE', dueDate: undefined } 
                  : p
               ));
          }
          setCurrentInServiceApt(null);
      }

      setAppointments(prev => {
          const updated = [...prev, newApt];
          return updated.sort((a, b) => new Date(`${a.rawDate}T${a.time}`).getTime() - new Date(`${b.rawDate}T${b.time}`).getTime());
      });

      setIsAppointmentModalOpen(false);
      setAppointmentClient(null);
      setFixedService(null);
      setIsNextSessionMode(false);
      setIsRenewalMode(false);
      setRewardDetails(null);
  };

  const handleConfirmPayment = (saleId: string, installmentNumber: number) => {
     const today = new Date().toISOString().split('T')[0];
     setAllSales(prevSales => prevSales.map(sale => {
        if (sale.id !== saleId) return sale;
        if (sale.packageId) {
             setActivePackages(prev => prev.map(p => p.id === sale.packageId ? { ...p, paymentStatus: 'PAID' } : p));
        }
        return {
           ...sale,
           installments: sale.installments.map(inst => inst.number === installmentNumber ? { ...inst, status: 'PAID', paidAt: today } : inst)
        };
     }));
  };

  const getPackageInfo = (apt: Appointment): { current: number; total: number; paymentStatus?: 'PAID' | 'PENDING' | 'NONE'; dueDate?: string } | null => {
    if (!apt.category?.toUpperCase().includes('PACOTE')) return null;
    const pkg = companyActivePackages.find(p => p.client === apt.client && p.service === apt.service);
    if (pkg) {
         return { 
             current: pkg.status === 'ACTIVE' ? pkg.current + 1 : pkg.current, 
             total: pkg.total, 
             paymentStatus: (pkg.paymentStatus as any) || 'NONE',
             dueDate: pkg.dueDate
         };
    }
    const serviceDef = companyServices.find(s => s.name === apt.service);
    return { current: 1, total: serviceDef?.sessionCount || 10, paymentStatus: 'NONE' };
  };

  const handleAlertStart = () => {
      if (!alertAppointment) return;
      handleStartAppointment(alertAppointment.id);
      setCurrentInServiceApt(alertAppointment);
      setAlertAppointment(null);
  };

  const handleAlertSnooze = (minutes: number) => {
      if (!alertAppointment) return;
      setSnoozedAlerts(prev => ({ ...prev, [alertAppointment.id]: new Date().getTime() + (minutes * 60000) }));
      setTriggeredAlerts(prev => prev.filter(id => id !== alertAppointment.id));
      setAlertAppointment(null);
  };

  const findActivePromo = (itemId: string, clientId: string | undefined) => {
    const today = new Date().toLocaleDateString('en-CA');
    return companyPromotions.find(p => 
      p.itemId === itemId && 
      p.active &&
      p.expiryDate >= today && 
      (p.targetClientIds.length === 0 || (clientId && p.targetClientIds.includes(clientId)))
    );
  };

  const handleInServiceFinish = (mode?: 'PAY_NOW') => {
      if (!currentInServiceApt) return;
      const isPackage = currentInServiceApt.category?.toUpperCase().includes('PACOTE');
      
      const client = companyClients.find(c => c.name === currentInServiceApt.client) || { 
          id: 't', 
          name: currentInServiceApt.client, 
          nickname: currentInServiceApt.clientNickname || '', 
          whatsapp: '', 
          birthday: '', 
          avatar: currentInServiceApt.avatar, 
          companyId: user?.companyId || '' 
      };

      if (mode === 'PAY_NOW') {
          const serviceProduct = companyServices.find(s => s.name === currentInServiceApt.service);
          
          let finalPrice = serviceProduct?.price || 0;
          if (serviceProduct) {
              const activePromo = findActivePromo(serviceProduct.id, client.id);
              if (activePromo) {
                  finalPrice = activePromo.promoPrice;
              }
          }

          const cartItem = serviceProduct ? [{ product: { ...serviceProduct, price: finalPrice }, quantity: 1 }] : [{
              product: { id: 'temp-pkg', name: currentInServiceApt.service, price: 0, description: 'Pacote Promocional', quantity: 1, type: 'SERVICE', subtype: 'PACKAGE', companyId: user?.companyId || '', image: null, sku: 'PKG-T' } as any,
              quantity: 1
          }];
          
          setSaleClient(client);
          setInitialCart(cartItem);
          setIsSalesModalOpen(true);
          setIsPackagePaymentFlow(true);
          return;
      }

      if (stockEnabled) {
          setPostStockAction(isPackage ? 'FINISH_PACKAGE' : 'FINISH_SERVICE');
          setIsStockConsumptionOpen(true);
          return;
      }

      if (isPackage) {
          const pkg = companyActivePackages.find(p => p.client === currentInServiceApt.client && p.service === currentInServiceApt.service);
          if (pkg) handleFinishSession(pkg.id);
          setCurrentInServiceApt(null);
      } else {
          proceedToPayment();
      }
  };

  const proceedToPayment = () => {
    if (!currentInServiceApt) return;
    
    const client = companyClients.find(c => c.name === currentInServiceApt.client) || { 
        id: 't', 
        name: currentInServiceApt.client, 
        nickname: currentInServiceApt.clientNickname || '', 
        whatsapp: '', 
        birthday: '', 
        avatar: currentInServiceApt.avatar, 
        companyId: user?.companyId || '' 
    };

    const serviceProduct = companyServices.find(s => s.name === currentInServiceApt.service);
    let basePrice = serviceProduct?.price || 0;
    
    if (serviceProduct) {
        const activePromo = findActivePromo(serviceProduct.id, client.id);
        if (activePromo) {
            basePrice = activePromo.promoPrice;
        }
    }

    const finalPrice = currentInServiceApt.discountApplied ? Math.max(0, basePrice - currentInServiceApt.discountApplied) : basePrice;
    
    const cartItem = serviceProduct ? [{ product: { ...serviceProduct, price: finalPrice }, quantity: 1 }] : [{
        product: { id: 'temp-srv', name: currentInServiceApt.service, price: 0, description: 'Serviço', quantity: 1, type: 'SERVICE', subtype: 'SINGLE', companyId: user?.companyId || '', image: null, sku: 'T' } as any,
        quantity: 1
    }];
    
    setSaleClient(client);
    setInitialCart(cartItem);
    setIsSalesModalOpen(true);
    setCurrentInServiceApt(null);
  };

  const proceedToScheduling = () => {
      if (!currentInServiceApt) return;
      const client = companyClients.find(c => c.name === currentInServiceApt.client);
      if (client) {
          setAppointmentClient(client);
          setFixedService(currentInServiceApt.service);
          setIsNextSessionMode(true);
          setIsAppointmentModalOpen(true);
      }
  };

  const handleConfirmStockConsumption = (consumedItems: { productId: string; quantity: number }[]) => {
      setAllProducts(prevProducts => {
          const newProducts = [...prevProducts];
          consumedItems.forEach(item => {
              const productIdx = newProducts.findIndex(p => p.id === item.productId);
              if (productIdx >= 0) {
                  const product = newProducts[productIdx];
                  const category = companyCategories.find(cat => cat.id === product.categoryId);
                  const peopleCount = category?.peopleCount || 1;
                  const deduction = item.quantity / peopleCount;
                  
                  newProducts[productIdx] = {
                      ...product,
                      quantity: Math.max(0, product.quantity - deduction)
                  };
              }
          });
          return newProducts;
      });

      setIsStockConsumptionOpen(false);

      if (user && consumedItems.length > 0) {
        db.stockConsumption.add({
          id: Date.now().toString(),
          companyId: user.companyId,
          appointmentId: currentInServiceApt?.id,
          clientId: currentInServiceApt?.client,
          consumedAt: new Date().toISOString(),
          items: consumedItems
        });
      }
      
      if (postStockAction === 'SCHEDULE_NEXT') {
          proceedToScheduling();
      } else if (postStockAction === 'FINISH_SERVICE') {
          proceedToPayment();
      } else if (postStockAction === 'FINISH_PACKAGE') {
          if (currentInServiceApt) {
            const pkg = companyActivePackages.find(p => p.client === currentInServiceApt.client && p.service === currentInServiceApt.service);
            if (pkg) handleFinishSession(pkg.id);
            setCurrentInServiceApt(null);
          }
      }
      setPostStockAction(null);
  };

  const handleScheduleNextSession = () => {
      if (!currentInServiceApt) return;
      if (stockEnabled) {
          setPostStockAction('SCHEDULE_NEXT');
          setIsStockConsumptionOpen(true);
          return;
      }
      proceedToScheduling();
  };

  const handleRenewPackageFromModal = () => {
      if (!currentInServiceApt) return;
      const client = companyClients.find(c => c.name === currentInServiceApt.client);
      if (client) {
          setAppointmentClient(client);
          setFixedService(currentInServiceApt.service);
          setIsRenewalMode(true);
          setIsAppointmentModalOpen(true);
      }
  };

  const handleAddToQueue = (clientId: string, serviceId: string) => {
    if (!user || !currentCompany) return;

    if (currentCompany.plan === 'ESSENTIAL' && companyQueue.length >= 3) {
      setLimitModalData({ title: 'Limite da Fila', message: 'No plano Essencial você pode ter até 3 clientes na fila de espera. Assine um plano superior para atendimento ilimitado.' });
      return;
    }

    const client = companyClients.find(c => c.id === clientId);
    const service = companyServices.find(s => s.id === serviceId);
    if (client && service) {
      setQueue(prev => [...prev, { 
          id: Date.now().toString(), 
          companyId: user.companyId, 
          clientId: client.id, 
          clientName: client.nickname || client.name, 
          clientAvatar: client.avatar, 
          serviceId: service.id, 
          serviceName: service.name, 
          category: service.subtype === 'PACKAGE' ? 'PACKAGE' : 'SINGLE', 
          addedAt: Date.now() 
      }]);
    }
  };

  const handleRemoveFromQueue = (id: string) => setQueue(prev => prev.filter(item => item.id !== id));

  const handlePromoteQueueToAppointment = (item: QueueItem, targetSlot?: { date: string, time: string }) => {
    if (!user) return;
    const client = companyClients.find(c => c.id === item.clientId);
    if (!client) return;
    handleRemoveFromQueue(item.id);
    if (targetSlot) {
        const dateObj = new Date(targetSlot.date + 'T12:00:00');
        const displayDate = dateObj.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' }).replace('.', '');
        const weekday = dateObj.toLocaleDateString('pt-BR', { weekday: 'long' }).split('-')[0].toUpperCase();
        const newApt: Appointment = { 
            id: Date.now(), 
            companyId: user.companyId, 
            time: targetSlot.time, 
            rawDate: targetSlot.date, 
            date: displayDate, 
            weekday: weekday, 
            client: client.name, 
            clientNickname: client.nickname, 
            avatar: client.avatar || '', 
            professional: 'A Definir', 
            professionalAvatar: 'https://ui-avatars.com/api/?name=Staff', 
            service: item.serviceName, 
            category: item.category === 'PACKAGE' ? 'PACOTE' : 'SERVIÇO AVULSO', 
            status: 'Confirmado', 
            canRemind: false 
        };
        setAppointments(prev => [...prev, newApt].sort((a, b) => new Date(`${a.rawDate}T${a.time}`).getTime() - new Date(`${b.rawDate}T${b.time}`).getTime()));
        return;
    }
    setAppointmentClient(client);
    setIsAppointmentModalOpen(true);
  };

  const handleRegisterRedemption = (data: any) => {
    if (!user) return;
    setPendingRedemptions(prev => [...prev, { 
        id: Date.now().toString(), 
        companyId: user.companyId, 
        ...data, 
        notifiedAt: Date.now() 
    }]);
  };

  const handleConfirmRedemption = (redemption: LoyaltyRedemption) => {
      const client = companyClients.find(c => c.id === redemption.clientId);
      if (client) {
          setAppointmentClient(client);
          setFixedService(redemption.productName);
          setRewardDetails(redemption);
          setClientSelectorMode('APPOINTMENT');
          setIsAppointmentModalOpen(true);
      }
  };

  const handleSavePromotion = (p: Promotion) => {
      if (!user) return;
      onSavePromotion({ ...p, companyId: user.companyId });
  };

  const onSavePromotion = (p: Promotion) => setPromotions(prev => [...prev, p]);
  const handleDeletePromotion = (id: string) => setPromotions(prev => prev.filter(p => p.id !== id));

  const handleSendManualStockReport = () => {
    if (!user) return;
    const lowStockItems = companyInventoryItems.filter(p => p.quantity <= (p.minQuantity || 5));
    if (lowStockItems.length === 0) {
      alert("Nenhum item com estoque baixo no momento.");
      return;
    }

    if (!stockWhatsApp) {
      alert("Por favor, configure o número de WhatsApp para alertas nos Ajustes.");
      return;
    }

    const cleanPhone = stockWhatsApp.replace(/\D/g, '');
    const finalPhone = cleanPhone.length <= 11 && !cleanPhone.startsWith('55') ? `55${cleanPhone}` : cleanPhone;
    
    let message = `📦 *LISTA DE COMPRAS - ESTOQUE* - ${currentCompany?.name}\n\n`;
    message += `Olá! Segue a lista de produtos que precisam de reposição:\n\n`;
    
    lowStockItems.forEach(item => {
      message += `• *${item.name}*\n`;
      message += `  Estoque Atual: *${Math.floor(item.quantity)} un*\n\n`;
    });

    message += `⚠️ _Favor providenciar a reposição destes itens._`;

    const url = `https://wa.me/${finalPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');

    setReportedProductIds(prev => {
        const newIds = lowStockItems.map(p => p.id);
        const unique = Array.from(new Set([...prev, ...newIds]));
        return unique;
    });
  };

  const handleTrialEndedAction = () => {
      setShowTrialEndModal(false);
      setUser(null);
      setShowLandingPage(true);
      setTimeout(() => {
          document.getElementById('planos')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
  };

  const handleSaveCompanyUser = (data: Partial<User>) => {
    if (!user || !currentCompany) return;
    
    // Verificação de limites de usuários baseada no plano (Master Admin não possui limites)
    if (!data.id && !isMasterAdmin) { // Apenas para novos cadastros
        if (currentCompany.plan === 'PROFESSIONAL' && companyUsers.length >= 2) {
            setLimitModalData({ 
                title: 'Limite de Usuários', 
                message: 'No plano Profissional você pode cadastrar até 2 usuários (incluindo o administrador). Assine o plano Premium para até 5 usuários.' 
            });
            return;
        }
        if (currentCompany.plan === 'PREMIUM' && companyUsers.length >= 5) {
            setLimitModalData({ 
                title: 'Limite de Usuários', 
                message: 'No plano Premium você atingiu o limite de 5 usuários. Entre em contato com nosso consultor para planos corporativos personalizados.',
                buttonLabel: 'Falar com Consultor'
            });
            return;
        }
    }
    
    const finalizeUserSave = () => {
        if (data.id) {
            setUsers(prev => prev.map(u => u.id === data.id ? { ...u, ...data } : u));
        } else {
            setUsers(prev => [...prev, { 
                ...data, 
                id: Date.now().toString(), 
                companyId: user.companyId 
            } as User]);
        }
        setIsUserModalOpen(false);
        setEditingUser(null);
        setShowUserSuccess(false);
    };

    if (!data.id) { 
        setShowUserSuccess(true);
        setTimeout(finalizeUserSave, 2500);
    } else {
        finalizeUserSave();
    }
  };

  if (showTrialEndModal && !isMasterAdmin) {
    return <TrialEndedModal onChoosePlan={handleTrialEndedAction} />;
  }

  if (!user && showLandingPage) {
    return <LandingPage onStart={handleStartFromLanding} />;
  }

  if (!user && !showLandingPage) {
    return (
      <div className="relative min-h-screen">
        <button 
          onClick={() => setShowLandingPage(true)}
          className="absolute top-6 left-6 z-20 text-xs font-bold text-gray-400 hover:text-purple-600 transition-colors flex items-center gap-1"
        >
          <ArrowRight className="rotate-180" size={14} />
          Voltar para Início
        </button>
        <LoginForm 
          users={users} 
          companies={companies}
          onLogin={handleLogin} 
          onRegister={handleRegister} 
          initialMode={loginInitialMode} 
          selectedPlan={selectedPlan}
          onSelectPlans={() => { setShowLandingPage(true); setTimeout(() => document.getElementById('planos')?.scrollIntoView({ behavior: 'smooth' }), 100); }}
        />
      </div>
    );
  }

  if (!user || !currentCompany) return null;

  const NavItem = ({ view, icon: Icon, label, highlight, hidden }: { view?: ViewState, icon: any, label: string, highlight?: boolean, hidden?: boolean }) => {
    if (hidden) return null;
    const isActive = currentView === view;
    return (
      <button 
        onClick={() => { if (view) setCurrentView(view); if (window.innerWidth < 768) setIsSidebarOpen(false); }}
        className={`w-full flex items-center py-4 transition-all duration-200 relative group px-6 gap-4 ${isActive ? 'text-white' : highlight ? 'bg-purple-50 text-purple-600' : 'text-gray-600 hover:bg-gray-50 hover:text-purple-600'}`}
      >
        {isActive && <div className="absolute inset-y-0 left-0 right-0 sidebar-gradient opacity-100 z-0"></div>}
        <div className="relative z-10 flex items-center gap-4 font-bold tracking-wide text-sm">
          <Icon size={20} strokeWidth={2.5} />
          <span className="whitespace-nowrap">{label}</span>
        </div>
      </button>
    );
  };

  return (
    <div className="flex h-screen bg-gray-50 text-gray-800 font-sans overflow-hidden relative">
      {showUserSuccess && <SuccessOverlay message="Usuário Cadastrado!" />}
      
      {limitModalData && (
          <LimitReachedModal 
            title={limitModalData.title}
            message={limitModalData.message}
            buttonLabel={limitModalData.buttonLabel}
            onPlans={goToPlans}
            onClose={() => setLimitModalData(null)}
          />
      )}

      <AssistantOnboarding 
        isOpen={showAssistant} 
        onClose={() => setShowAssistant(false)} 
        onCompleteSettings={handleAssistantCompleteSettings}
        onTriggerTask={handleAssistantTaskTrigger}
        taskStep={onboardingTaskStep}
        currentPlan={currentCompany.plan}
      />

      <ConfirmDeleteModal 
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={confirmAndExecuteDelete}
        title={`Excluir ${itemToDelete?.type === 'CLIENT' ? 'Cliente' : itemToDelete?.type === 'PRODUCT' ? 'Produto' : itemToDelete?.type === 'PROFESSIONAL' ? 'Profissional' : itemToDelete?.type === 'COMPANY_USER' ? 'Usuário' : 'Categoria'}?`}
        message={`Tem certeza que deseja apagar ${itemToDelete?.name}? Esta ação não pode ser desfeita.`}
      />
      <AppointmentAlertModal appointment={alertAppointment} onClose={() => setAlertAppointment(null)} onStart={handleAlertStart} onSnooze={handleAlertSnooze} packageInfo={alertAppointment ? getPackageInfo(alertAppointment) : null} />
      
      <InServiceModal 
        appointment={currentInServiceApt} 
        isOpen={!!currentInServiceApt && !isStockConsumptionOpen} 
        onClose={() => setCurrentInServiceApt(null)} 
        onFinish={handleInServiceFinish} 
        packageInfo={currentInServiceApt ? getPackageInfo(currentInServiceApt) : null} 
        onScheduleNext={handleScheduleNextSession} 
        onRenew={handleRenewPackageFromModal} 
      />
      
      <StockConsumptionModal isOpen={isStockConsumptionOpen} onClose={() => { setIsStockConsumptionOpen(false); setPostStockAction(null); }} onConfirm={handleConfirmStockConsumption} products={companyInventoryItems} categories={companyCategories} />
      <QueueModal isOpen={isQueueModalOpen} onClose={() => setIsQueueModalOpen(false)} onConfirm={handleAddToQueue} clients={companyClients} services={companyServices} />
      <PackageConclusionModal isOpen={!!packageConclusionData} onClose={() => setPackageConclusionData(null)} data={packageConclusionData} onRenew={handleRenewPackage} onEnd={handleEndPackage} />
      <ClientHistoryModal client={historyClient} isOpen={!!historyClient} onClose={() => setHistoryClient(null)} sales={companySales} products={companyProducts} />
      <ProfessionalHistoryModal professional={historyProfessional} isOpen={!!historyProfessional} onClose={() => setHistoryProfessional(null)} appointments={companyAppointments} clients={companyClients} />
      <BirthdayModal 
        isOpen={isBirthdayModalOpen} 
        onClose={() => setIsBirthdayModalOpen(false)} 
        birthdayClients={birthdayClients} 
        companyName={currentCompany.name} 
        congratulatedIds={congratulatedIds}
        onCongratulate={(id) => setCongratulatedIds(prev => [...prev, id])}
      />
      
      <HelpModal 
        isOpen={isHelpModalOpen} 
        onClose={() => setIsHelpModalOpen(false)} 
        currentPlan={currentCompany.plan} 
      />

      <UserFormModal 
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        onSave={handleSaveCompanyUser}
        initialData={editingUser}
      />

      <DatabaseStatusModal 
        isOpen={isMasterAdmin && isDbStatusModalOpen}
        onClose={() => setIsDbStatusModalOpen(false)}
      />

      {isSidebarOpen && <div className="fixed inset-0 z-20 bg-black/50 md:hidden animate-in fade-in duration-200 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />}

      <aside className={`bg-white h-full flex flex-col transition-all duration-300 overflow-hidden whitespace-nowrap fixed md:relative z-30 shadow-2xl md:shadow-none ${isSidebarOpen ? 'w-72 border-r border-gray-100' : 'w-0 border-none'}`}>
        <div className="h-20 flex items-center justify-between px-6 min-w-[18rem] border-b border-gray-100/80">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-500 text-white flex items-center justify-center font-black shadow-md shadow-purple-200">
              <Zap size={20} fill="currentColor" />
            </div>
            <div>
              <h1 className="text-2xl font-black gradient-text tracking-tight leading-none">Gendly</h1>
              <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 block mt-0.5">MicroSaaS Multi-Empresas</span>
            </div>
          </div>
        </div>

        {/* Seletor ou Bloqueio de Empresa */}
        <div className="p-4 border-b border-gray-100 bg-gray-50/70 min-w-[18rem]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
              <Building size={12} className="text-purple-600" /> Empresa Ativa
            </span>
            {isMasterAdmin ? (
              <span className="text-[9px] font-black uppercase bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                {companies.length} {companies.length === 1 ? 'Unidade' : 'Unidades'}
              </span>
            ) : (
              <span className="text-[9px] font-black uppercase bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Lock size={10} /> Unidade Exclusiva
              </span>
            )}
          </div>

          {isMasterAdmin ? (
            <div className="relative">
              <select
                value={user.companyId}
                onChange={(e) => {
                  const selectedId = e.target.value;
                  setUser(prev => prev ? { ...prev, companyId: selectedId } : null);
                }}
                className="w-full text-xs font-bold text-gray-800 bg-white border border-gray-200 rounded-xl py-2.5 pl-3 pr-8 focus:outline-none focus:ring-2 focus:ring-purple-300 shadow-sm appearance-none cursor-pointer hover:border-purple-200 transition-colors"
              >
                {companies.map(comp => (
                  <option key={comp.id} value={comp.id}>
                    {comp.name} ({comp.plan})
                  </option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          ) : (
            <div className="p-3 bg-white border border-purple-200/80 rounded-xl shadow-xs">
              <div className="flex items-center justify-between gap-1">
                <span className="text-xs font-bold text-gray-900 truncate">
                  {currentCompany.name}
                </span>
                <span className="px-1.5 py-0.5 text-[8px] font-black uppercase bg-purple-100 text-purple-700 rounded shrink-0">
                  {currentCompany.plan}
                </span>
              </div>
              <p className="text-[10px] text-gray-500 truncate mt-0.5">
                {currentCompany.subName || 'Estética & Beleza Premium'}
              </p>
              <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between text-[9px] font-bold text-emerald-700">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Administradora Exclusiva
                </span>
                <span className="text-purple-600">Vitalício</span>
              </div>
            </div>
          )}

          <div className="mt-2 flex items-center justify-between text-[11px] text-gray-500 font-medium px-1">
            <span className="truncate">{currentCompany.subName || 'Painel Principal'}</span>
            <span className="text-purple-600 font-bold shrink-0">{currentCompany.plan}</span>
          </div>
        </div>

        {/* Status Conexão de Banco de Dados - Visível exclusivamente para o Administrador Master */}
        {isMasterAdmin && (
          <div className="px-4 pt-3 pb-1 min-w-[18rem]">
            <button
              onClick={() => setIsDbStatusModalOpen(true)}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-emerald-800 bg-emerald-50/70 hover:bg-emerald-100/90 border border-emerald-200/80 transition-all text-left group shadow-xs cursor-pointer"
              title="Clique para inspecionar as 16 tabelas salvas no banco de dados e gerar backup"
            >
              <div className="relative">
                <Database size={15} className="text-emerald-600 group-hover:scale-110 transition-transform" />
                <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              </div>
              <div className="flex-1 min-w-0">
                <span className="block truncate text-[11px] font-bold">Banco de Dados Ativo</span>
                <span className="text-[9px] text-emerald-600 font-medium block">16 Tabelas Conectadas</span>
              </div>
              <span className="text-[8px] font-black uppercase px-1.5 py-0.5 bg-emerald-200/60 text-emerald-800 rounded">
                OK
              </span>
            </button>
          </div>
        )}

        <nav className="flex-1 overflow-y-auto py-3 scrollbar-hide min-w-[18rem]">
          <NavItem view={ViewState.DASHBOARD} icon={LayoutDashboard} label="Painel Inicial" highlight />
          <NavItem view={ViewState.CALENDAR} icon={CalendarDays} label="Agenda" />
          <NavItem view={ViewState.CLIENTS} icon={Users} label="Clientes" />
          <NavItem view={ViewState.PRODUCTS} icon={Briefcase} label="Serviços" />
          <NavItem view={ViewState.PROFESSIONALS} icon={Users} label="Profissionais" />
          <NavItem view={ViewState.PROMOTIONS} icon={Tag} label="Promoções" hidden={currentCompany.plan === 'ESSENTIAL' || !promotionsEnabled || !user.permissions.promotions} />
          <NavItem view={ViewState.LOYALTY} icon={Heart} label="Fidelidade" hidden={currentCompany.plan === 'ESSENTIAL' || !loyaltyEnabled || !user.permissions.loyalty} />
          <NavItem view={ViewState.FINANCIAL} icon={DollarSign} label="Financeiro" hidden={!user.permissions.financial} />
          <NavItem view={ViewState.STORE} icon={ShoppingBag} label="Loja" hidden={currentCompany.plan === 'ESSENTIAL' || !storeEnabled || !user.permissions.store} />
          <NavItem view={ViewState.STOCK} icon={Package} label="Estoque" hidden={!stockEnabled || !user.permissions.stock} />
          <NavItem view={ViewState.SETTINGS} icon={Settings} label="Ajustes" highlight hidden={!user.permissions.settings} />
        </nav>

        <div className="p-4 border-t border-gray-100 min-w-[18rem] space-y-3 bg-white">
          <div className={`flex items-center gap-3 p-2.5 rounded-2xl border ${isMasterAdmin ? 'bg-gradient-to-r from-purple-50 via-pink-50 to-amber-50 border-purple-200/80 shadow-sm' : 'bg-purple-50/60 border-purple-100/80'}`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black shadow-sm shrink-0 ${isMasterAdmin ? 'bg-gradient-to-tr from-amber-400 via-purple-600 to-pink-500 text-white shadow-purple-200' : user.role === 'ADMIN' ? 'bg-gradient-to-tr from-purple-600 to-pink-500 text-white' : 'bg-sky-100 text-sky-700'}`}>
              <Crown size={18} className={isMasterAdmin ? 'text-amber-200' : ''} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-black text-gray-900 truncate leading-tight flex items-center gap-1">
                <span className="truncate">{user.name}</span>
              </div>
              <div className="text-[10px] text-purple-700 font-mono font-medium truncate mt-0.5">
                {user.username}
              </div>
              {isMasterAdmin && (
                <div className="text-[9px] font-bold text-emerald-600 flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Sem Expiração
                </div>
              )}
            </div>
            <span className={`px-2 py-0.5 text-[9px] font-black rounded uppercase tracking-wider ${isMasterAdmin ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-sm' : 'bg-purple-600 text-white'}`}>
              {isMasterAdmin ? 'MASTER' : user.role}
            </span>
          </div>

          <button 
            onClick={() => { setUser(null); setShowLandingPage(true); }} 
            className="w-full flex items-center justify-center py-2.5 px-4 gap-2 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors font-bold text-xs border border-rose-200"
          >
            <LogOut size={16} /><span>Sair do Sistema</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden bg-gray-50/50">
        <header className="h-24 bg-white border-b border-gray-100 flex items-center justify-between px-4 md:px-12 relative shadow-sm z-20">
           <div className="flex items-center gap-4">
             <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:shadow-lg transition-all duration-200" title="Alternar Menu">
               <Menu size={24} strokeWidth={2.5} />
             </button>
             {!isSidebarOpen && (
               <div className="hidden md:flex items-center gap-2">
                 <h2 className="text-xl font-black gradient-text">Gendly</h2>
                 <span className="text-[10px] font-black uppercase tracking-wider bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">Multi-Empresas</span>
               </div>
             )}
           </div>
           
           <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 md:static md:transform-none md:flex md:items-center md:gap-6">
              <div className="flex flex-col md:flex-row items-center gap-2 md:gap-3">
                 <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-lg ring-2 ring-purple-50 overflow-hidden shrink-0">
                    {currentCompany.logo ? <img src={currentCompany.logo} alt="Logo" className="w-full h-full object-cover" /> : currentCompany.name.charAt(0)}
                 </div>
                 <div className="text-center md:text-left">
                    <h3 className="font-bold text-sm text-gray-900 leading-tight">{currentCompany.name}</h3>
                    {currentCompany.subName && <p className="text-[10px] text-purple-600 font-bold uppercase tracking-wide leading-tight mt-0.5">{currentCompany.subName}</p>}
                 </div>
              </div>
           </div>

            <div className="flex items-center gap-3">
              {/* Indicador Interativo do Banco de Dados Conectado - Visível exclusivamente para o Administrador Master */}
              {isMasterAdmin && (
                <button
                  onClick={() => setIsDbStatusModalOpen(true)}
                  className="flex items-center gap-2 px-3 py-2 bg-emerald-50 hover:bg-emerald-100/90 border border-emerald-200 text-emerald-900 rounded-xl text-xs font-bold transition-all shadow-xs group cursor-pointer"
                  title="Clique para inspecionar todas as 16 tabelas e o status de sincronização do banco de dados"
                >
                  <div className="relative flex items-center justify-center">
                    <Database size={16} className="text-emerald-600 group-hover:scale-110 transition-transform" />
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500"></span>
                  </div>
                  <div className="text-left hidden lg:block leading-tight">
                    <span className="text-[9px] uppercase tracking-wider text-emerald-600 font-black block">Banco Conectado</span>
                    <span className="text-[11px] font-bold text-emerald-950 block">16 Tabelas • LocalStorage</span>
                  </div>
                  <span className="lg:hidden text-[10px] font-bold text-emerald-900">Banco OK</span>
                </button>
              )}

              <div className={`hidden sm:flex items-center gap-2.5 border rounded-2xl p-1.5 pr-3 ${isMasterAdmin ? 'bg-purple-50/70 border-purple-200 shadow-sm' : 'bg-gray-50 border-gray-100'}`}>
                 <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold ${isMasterAdmin ? 'bg-gradient-to-tr from-amber-400 via-purple-600 to-pink-500 shadow-sm' : user.role === 'ADMIN' ? 'bg-gradient-to-tr from-purple-600 to-pink-500' : 'bg-gray-700'}`}>
                   <Crown size={16} className={isMasterAdmin ? 'text-amber-200' : ''} />
                 </div>
                 <div className="text-left">
                   <div className="flex items-center gap-1.5">
                     <span className="text-[9px] font-black text-purple-700 uppercase leading-none block">
                       {isMasterAdmin ? 'Administrador Master' : user.role === 'ADMIN' ? 'Administrador' : 'Usuário'}
                     </span>
                     {isLifetimeUser && (
                       <span className="px-1 py-0.2 bg-emerald-100 text-emerald-700 text-[8px] font-black rounded uppercase">
                         Vitalício
                       </span>
                     )}
                   </div>
                   <span className="text-xs font-bold text-gray-800 leading-none mt-1 block">
                     {user.name}
                   </span>
                 </div>
              </div>
             <button 
                onClick={() => setIsBirthdayModalOpen(true)}
                className="relative p-3 bg-pink-50 text-pink-600 rounded-xl hover:bg-pink-100 transition-all group border border-pink-100"
                title="Ver aniversariantes do dia"
             >
                <Cake size={24} strokeWidth={2.5} className="group-hover:scale-110 transition-transform" />
                {birthdayClients.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-[10px] font-black rounded-full border-2 border-white flex items-center justify-center animate-bounce shadow-sm">
                        {birthdayClients.length}
                    </span>
                )}
             </button>
           </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 md:p-10">
           {currentView === ViewState.DASHBOARD && (
             /* Fix: Corrected prop name from isAutoReportMonth to isAutoReportDay to match DashboardHomeProps interface */
             <DashboardHome products={companyProducts} categories={companyCategories} clients={companyClients} sales={companySales} appointments={companyAppointments} activePackages={companyActivePackages} queue={companyQueue} pixKey={pixKey} onConfirmPayment={handleConfirmPayment} onNewClient={() => { setEditingClient(null); setIsClientModalOpen(true); }} onNewAppointment={() => { setClientSelectorMode('APPOINTMENT'); setIsClientSelectorOpen(true); }} onUpdateAppointments={(newApts) => setAppointments(newApts)} onConfirmAppointment={handleConfirmAppointment} onStartAppointment={handleStartAppointment} onFinishSession={handleFinishSession} onOpenQueue={() => setIsQueueModalOpen(true)} onRemoveFromQueue={handleRemoveFromQueue} onPromoteQueueToAppointment={handlePromoteQueueToAppointment} getPackageInfo={getPackageInfo} pendingRedemptions={companyPendingRedemptions} onConfirmRedemption={handleConfirmRedemption} loyaltyEnabled={loyaltyEnabled} settings={{ openingTime, closingTime, interval: schedulingInterval }} onViewClientHistory={(c) => setHistoryClient(c)} onNewSale={() => { setClientSelectorMode('SALE'); setInitialCart([]); setIsClientSelectorOpen(true); }} stockEnabled={stockEnabled} stockWhatsApp={stockWhatsApp} onSendStockReport={handleSendManualStockReport} onReplenishStock={handleReplenishStock} reportedProductIds={reportedProductIds} storeEnabled={storeEnabled} isAutoReportDay={lastAutoReportMonth === new Date().getMonth() && stockReportDay === new Date().getDate()} onUpgradePlan={() => { setUser(null); setShowLandingPage(true); setTimeout(() => document.getElementById('planos')?.scrollIntoView({ behavior: 'smooth' }), 100); }} plan={currentCompany.plan} userPermissions={user.permissions} />
           )}
           
           {currentView === ViewState.CALENDAR && (
             <CalendarView appointments={companyAppointments} onSlotClick={handleCalendarSlotClick} onAppointmentClick={(apt) => console.log('Appointment Clicked', apt)} openingTime={openingTime} closingTime={closingTime} interval={schedulingInterval} onNewAppointment={() => { setClientSelectorMode('APPOINTMENT'); setIsClientSelectorOpen(true); }} />
           )}

           {currentView === ViewState.FINANCIAL && user.permissions.financial && (
             <FinancialDashboard 
               sales={companySales} 
               products={companyProducts} 
               clients={companyClients}
               storeEnabled={currentCompany.plan === 'ESSENTIAL' ? false : (storeEnabled && user.permissions.store)} 
             />
           )}
           
           {currentView === ViewState.LOYALTY && loyaltyEnabled && user.permissions.loyalty && (
             <LoyaltyDashboard clients={companyClients} sales={companySales} products={companyProducts} settings={{ enabled: loyaltyEnabled, serviceGoal: loyaltyServiceGoal }} onRegisterRedemption={handleRegisterRedemption} />
           )}

           {currentView === ViewState.PROMOTIONS && promotionsEnabled && user.permissions.promotions && (
             <PromotionPage products={companyProducts} clients={companyClients} promotions={companyPromotions} onSavePromotion={handleSavePromotion} onDeletePromotion={handleDeletePromotion} />
           )}

           {currentView === ViewState.STOCK && stockEnabled && user.permissions.stock && (
             <InventoryPage 
                products={companyInventoryItems} 
                categories={companyCategories}
                onUpdateQuantity={handleUpdateProductQuantity}
                onEditProduct={(p) => { setEditingProduct(p); setIsProductModalOpen(true); }}
                onDeleteProduct={(id) => setItemToDelete({ id, type: 'PRODUCT', name: companyProducts.find(p => p.id === id)?.name || '' })}
                onNewProduct={() => { setEditingProduct(null); setIsProductModalOpen(true); }}
                onAddCategory={(name, unit, quantity, peopleCount) => handleSaveCategory({ name, unit, quantity, peopleCount, companyId: user.companyId })}
                onSaveCategory={handleSaveCategory}
                onDeleteCategory={(id) => setItemToDelete({ id, type: 'CATEGORY', name: companyCategories.find(c => c.id === id)?.name || '' })}
             />
           )}
           
           {currentView === ViewState.PRODUCTS && (
             <div>
               <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
                 <div><h2 className="text-3xl font-bold text-gray-900 mb-1">Serviços & Pacotes</h2><p className="text-gray-400">Gerencie seu menu de procedimentos.</p></div>
                 <div className="flex gap-3">
                     <button onClick={() => { setEditingProduct(null); setIsProductModalOpen(true); }} className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-bold text-sm hover:shadow-lg transition-all flex items-center justify-center gap-2"><Plus size={18} /> Novo {serviceTab === 'SINGLE' ? 'Serviço' : 'Pacote'}</button>
                 </div>
               </div>
               <div className="flex gap-2 mb-6 border-b border-gray-200">
                   <button onClick={() => setServiceTab('SINGLE')} className={`px-6 py-3 font-bold text-sm border-b-2 transition-colors ${serviceTab === 'SINGLE' ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>Serviços Avulsos</button>
                   <button onClick={() => setServiceTab('PACKAGE')} className={`px-6 py-3 font-bold text-sm border-b-2 transition-colors ${serviceTab === 'PACKAGE' ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>Pacotes Promocionais</button>
               </div>
               <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                 <div className="hidden md:block">
                    <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider"><th className="px-8 py-6">Item</th><th className="px-6 py-6">Detalhes</th><th className="px-6 py-6">Preço</th><th className="px-6 py-6">Status</th><th className="px-8 py-6 text-right">Ações</th></tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {(serviceTab === 'SINGLE' ? singleServices : packages).map(p => (
                        <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-8 py-5">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden shrink-0">{p.image ? <img src={p.image} className="w-full h-full object-cover" alt={p.name} /> : <div className="w-full h-full flex items-center justify-center text-gray-400">{p.subtype === 'PACKAGE' ? <Layers size={20} /> : <Scissors size={20} />}</div>}</div>
                                <div><div className="font-bold text-gray-900 flex items-center gap-2">{p.name}</div><div className="text-sm text-gray-400 max-w-xs truncate">{p.description}</div></div>
                            </div>
                            </td>
                            <td className="px-6 py-5">{p.subtype === 'PACKAGE' ? <div className="flex flex-col"><span className="text-xs font-bold text-purple-600 uppercase">Pacote</span><span className="text-[10px] text-gray-400">{p.sessionCount} Sessões</span></div> : <span className="text-xs font-bold text-gray-500 uppercase">Serviço Avulso</span>}</td>
                            <td className="px-6 py-5 font-bold text-gray-700">R$ {p.price.toFixed(2).replace('.', ',')}</td>
                            <td className="px-6 py-5"><span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-xs font-bold">Ativo</span></td>
                            <td className="px-8 py-5 text-right"><div className="flex justify-end gap-2"><button onClick={() => { setEditingProduct(p); setIsProductModalOpen(true); }} className="p-2 text-gray-400 hover:text-purple-600 transition-colors"><Edit size={18}/></button><button onClick={() => setItemToDelete({ id: p.id, type: 'PRODUCT', name: p.name })} className="p-2 text-red-500 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"><Trash2 size={18}/></button></div></td>
                        </tr>
                        ))}
                    </tbody>
                    </table>
                 </div>
                 <div className="md:hidden p-4 space-y-4">
                    {(serviceTab === 'SINGLE' ? singleServices : packages).map(p => (
                        <div key={p.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden shrink-0">{p.image ? <img src={p.image} className="w-full h-full object-cover" alt={p.name} /> : <div className="w-full h-full flex items-center justify-center text-gray-400">{p.subtype === 'PACKAGE' ? <Layers size={20} /> : <Scissors size={20} />}</div>}</div>
                                    <div><h3 className="font-bold text-gray-900 text-lg leading-tight">{p.name}</h3><span className="text-xs text-gray-400">{p.sku}</span></div>
                                </div>
                                <div className="font-bold text-gray-700 text-lg">R$ {p.price.toFixed(2).replace('.', ',')}</div>
                            </div>
                            <p className="text-sm text-gray-500 mb-5 line-clamp-2">{p.description}</p>
                            <div className="grid grid-cols-2 gap-3 border-t border-gray-50 pt-4"><button onClick={() => { setEditingProduct(p); setIsProductModalOpen(true); }} className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gray-50 text-gray-600 text-xs font-bold hover:bg-purple-50 transition-colors"><Edit size={16} /> Editar</button><button onClick={() => setItemToDelete({ id: p.id, type: 'PRODUCT', name: p.name })} className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-50 text-red-500 text-xs font-bold hover:bg-red-100 transition-colors"><Trash2 size={16} /> Excluir</button></div>
                        </div>
                    ))}
                 </div>
               </div>
             </div>
           )}

           {currentView === ViewState.STORE && storeEnabled && user.permissions.store && (
             <div>
               <div className="flex justify-between items-end mb-8">
                 <div><h2 className="text-3xl font-bold text-gray-900 mb-1">Loja</h2><p className="text-gray-400">Gerencie produtos para venda.</p></div>
                 <button onClick={() => { setEditingProduct(null); setIsProductModalOpen(true); }} className="bg-purple-600 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-purple-700 transition-all flex items-center gap-2 shadow-lg"><Plus size={18} /> Novo Produto</button>
               </div>
               <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hidden md:block">
                 <table className="w-full text-left">
                   <thead><tr className="border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider"><th className="px-8 py-6">Produto</th><th className="px-6 py-6">Estoque</th><th className="px-6 py-6">Valor Unit.</th><th className="px-8 py-6 text-right">Ações</th></tr></thead>
                   <tbody className="divide-y divide-gray-50">
                     {companyStoreItems.map(p => (
                       <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                         <td className="px-8 py-5"><div className="flex items-center gap-4">{p.image ? <img src={p.image} alt={p.name} className="w-10 h-10 rounded-lg object-cover" /> : <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400"><Package size={20}/></div>}<div><div className="font-bold text-gray-900">{p.name}</div><div className="text-sm text-gray-400 max-w-xs truncate">{p.description}</div></div></div></td>
                         <td className="px-6 py-5"><div className={`font-bold ${p.quantity <= (p.minQuantity || 5) ? 'text-red-500' : 'text-gray-700'}`}>{Math.floor(p.quantity)} un</div></td>
                         <td className="px-6 py-5 font-bold text-gray-700">R$ {p.price.toFixed(2).replace('.', ',')}</td>
                         <td className="px-8 py-5 text-right"><div className="flex justify-end gap-2"><button onClick={() => { setEditingProduct(p); setIsProductModalOpen(true); }} className="p-2 text-gray-400 hover:text-purple-600 transition-colors"><Edit size={18}/></button><button onClick={() => setItemToDelete({ id: p.id, type: 'PRODUCT', name: p.name })} className="p-2 text-red-500 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"><Trash2 size={18}/></button></div></td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
               <div className="md:hidden grid grid-cols-1 gap-4">
                  {companyStoreItems.map(p => (
                    <div key={p.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                      <div className="flex gap-4 mb-4"><div className="w-20 h-20 bg-gray-100 rounded-xl flex-shrink-0 overflow-hidden">{p.image ? <img src={p.image} alt={p.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-300"><Package size={24} /></div>}</div><div className="flex-1 min-w-0"><div className="flex justify-between items-start"><h3 className="font-bold text-gray-900 truncate pr-2">{p.name}</h3><span className={`text-xs font-bold px-2 py-1 rounded-full ${p.quantity <= (p.minQuantity || 5) ? 'bg-red-50 text-red-500' : 'bg-gray-100 text-gray-500'}`}>{Math.floor(p.quantity)} un</span></div><p className="text-xs text-gray-400 line-clamp-2 mt-1 mb-2">{p.description}</p><div className="font-bold text-lg text-gray-900">R$ {p.price.toFixed(2).replace('.', ',')}</div></div></div>
                      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-50"><button onClick={() => { setEditingProduct(p); setIsProductModalOpen(true); }} className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gray-50 text-gray-600 text-xs font-bold hover:bg-purple-50 transition-colors"><Edit size={16} /> Editar</button><button onClick={() => setItemToDelete({ id: p.id, type: 'PRODUCT', name: p.name })} className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-50 text-red-500 text-xs font-bold hover:bg-red-100 transition-colors"><Trash2 size={16} /> Excluir</button></div>
                    </div>
                  ))}
               </div>
             </div>
           )}

           {currentView === ViewState.CLIENTS && (
             <div>
               <div className="flex justify-between items-end mb-8">
                 <div><h2 className="text-3xl font-bold text-gray-900 mb-1">Meus Clientes</h2><p className="text-gray-400">Gerencie sua base de clientes.</p></div>
                 <button onClick={() => { setEditingClient(null); setIsClientModalOpen(true); }} className="bg-purple-600 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-purple-700 transition-colors flex items-center gap-2 shadow-lg"><Plus size={18} /> Novo Cliente</button>
               </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                 {companyClients.map(c => (
                   <div key={c.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all group flex flex-col gap-3">
                     <div className="flex items-start gap-4">
                        <div className="relative shrink-0">{c.avatar ? <img src={c.avatar} alt={c.name} className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm" /> : <div className="w-14 h-14 rounded-full bg-lilac-100 flex items-center justify-center text-lilac-600 text-lg font-bold">{c.name.charAt(0)}</div>}</div>
                        <div className="flex-1 min-w-0 pt-0.5">
                            <h3 className="text-base font-bold text-gray-800 truncate group-hover:text-purple-600 transition-colors leading-tight">{c.nickname || c.name}</h3>
                            {c.nickname && <p className="text-xs text-gray-400 truncate mt-0.5">{c.name}</p>}
                            <div className="flex items-center gap-1.5 mt-2 bg-gray-50 w-fit px-2 py-1 rounded-md"><Scissors size={10} className="text-purple-500" /><span className="text-[10px] font-bold text-gray-600">{companySales.filter(s => s.clientId === c.id).length} Atendimentos</span></div>
                        </div>
                     </div>
                     <div className="h-px bg-gray-50 w-full"></div>
                     <div className="flex items-center gap-2">
                         <button onClick={() => setHistoryClient(c)} className="flex-1 py-1.5 rounded-lg bg-purple-50 text-purple-600 text-[10px] font-bold uppercase tracking-wider hover:bg-purple-100 transition-colors border border-purple-100">Ver Histórico</button>
                         <button onClick={() => { setEditingClient(c); setIsClientModalOpen(true); }} className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-gray-100 rounded-lg transition-colors"><Edit size={18}/></button>
                         <button 
                           type="button"
                           onClick={(e) => { e.stopPropagation(); setItemToDelete({ id: c.id, type: 'CLIENT', name: c.name }); }} 
                           className="p-1.5 text-red-500 bg-red-50 hover:bg-red-100 rounded-lg transition-colors" 
                           title="Excluir cadastro"
                         >
                           <Trash2 size={18}/>
                         </button>
                     </div>
                   </div>
                 ))}
               </div>
             </div>
           )}

           {currentView === ViewState.PROFESSIONALS && (
             <div>
               <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
                 <div><h2 className="text-3xl font-bold text-gray-900 mb-1">Profissionais</h2><p className="text-gray-400">Gerencie sua equipe e especialidades.</p></div>
                 <div className="flex gap-3">
                     <button onClick={() => { setEditingProfessional(null); setIsProfessionalModalOpen(true); }} className="bg-purple-600 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-purple-700 transition-colors flex items-center gap-2 shadow-lg"><Plus size={18} /> Novo Profissional</button>
                     <button onClick={() => setIsSpecialtyModalOpen(true)} className="bg-white text-purple-600 border border-purple-200 px-6 py-3 rounded-xl font-bold text-sm hover:bg-purple-50 transition-colors flex items-center gap-2"><Tag size={18} /> Especialidades</button>
                 </div>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                 {companyProfessionals.map(prof => (
                   <div key={prof.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all group relative overflow-hidden flex flex-col gap-3">
                     <div className="flex items-center gap-4">
                         <div className="relative shrink-0">{prof.avatar ? <img src={prof.avatar} alt={prof.name} className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-md" /> : <div className="w-14 h-14 rounded-full bg-lilac-100 flex items-center justify-center text-lilac-600 text-xl font-bold">{prof.name.charAt(0)}</div>}</div>
                         <div className="min-w-0 flex-1"><h3 className="text-base font-bold text-gray-800 group-hover:text-purple-600 transition-colors truncate">{prof.nickname || prof.name}</h3><p className="text-xs text-gray-400 font-medium truncate mb-1">{prof.name}</p><div className="flex items-center gap-2"><div className="flex items-center gap-1 bg-blue-50 px-2 py-0.5 rounded text-[10px] font-bold text-blue-700 border border-blue-100"><Tag size={10} /> {companySpecialties.find(s => s.id === prof.specialtyId)?.name || 'N/A'}</div></div></div>
                     </div>
                     <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-100"><Scissors size={14} className="text-purple-500" /><span className="text-xs font-bold text-gray-600">{companyAppointments.filter(a => (a.professional === prof.nickname || a.professional === prof.name) && a.status !== 'Cancelado').length} Atendimentos</span></div>
                     <div className="flex gap-2 pt-1"><button onClick={() => setHistoryProfessional(prof)} className="flex-1 py-1.5 rounded-lg border border-gray-200 text-gray-600 text-[10px] font-bold uppercase tracking-wider hover:bg-gray-50 transition-all flex items-center justify-center gap-1"><History size={14} /> Histórico</button><button onClick={() => { setEditingProfessional(prof); setIsProfessionalModalOpen(true); }} className="p-1.5 bg-gray-50 text-gray-400 rounded-lg hover:text-purple-600 hover:bg-purple-50 transition-colors"><Edit size={16}/></button><button onClick={() => setItemToDelete({ id: prof.id, type: 'PROFESSIONAL', name: prof.name })} className="p-1.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors"><Trash2 size={16}/></button></div>
                   </div>
                 ))}
               </div>
             </div>
           )}

           {currentView === ViewState.SETTINGS && user.permissions.settings && (
             <div className="max-w-2xl mx-auto pb-10">
                <div className="mb-8"><h2 className="text-3xl font-bold text-gray-900 mb-1">Ajustes</h2><p className="text-gray-400">Configure as preferências do sistema.</p></div>
                
                <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 mb-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2"><Building className="text-purple-500" /> Dados da Empresa</h3>
                    <div className="flex flex-col md:flex-row items-center gap-8">
                        <div className="relative group cursor-pointer shrink-0">
                            <div className="w-32 h-32 rounded-full border-4 border-gray-100 overflow-hidden bg-gray-50 flex items-center justify-center group-hover:border-purple-200 transition-colors shadow-sm">{settingsCompanyLogo ? <img src={settingsCompanyLogo} alt="Logo" className="w-full h-full object-cover" /> : <Building size={40} className="text-gray-300" />}</div>
                            <label className="absolute bottom-0 right-0 p-2.5 bg-purple-600 text-white rounded-full shadow-lg cursor-pointer hover:bg-purple-700 border-2 border-white"><Camera size={18} /><input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} /></label>
                        </div>
                        <div className="flex-1 w-full space-y-4">
                            <div><label className="block text-xs font-bold text-taupe-500 uppercase tracking-wider mb-2">Nome do Negócio</label><input type="text" value={settingsCompanyName} onChange={(e) => setSettingsCompanyName(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-200 text-lg font-bold text-gray-800 placeholder-gray-300" placeholder="Digite o nome da empresa" /></div>
                            <div><label className="block text-xs font-bold text-taupe-500 uppercase tracking-wider mb-2">Sub Nome / Slogan</label><input type="text" value={settingsCompanySubName} onChange={(e) => setSettingsCompanySubName(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-200 text-gray-600 font-medium placeholder-gray-300" placeholder="Ex: Estética Avançada" /></div>
                        </div>
                    </div>
                </div>

               <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 mb-6">
                 <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2"><DollarSign className="text-emerald-500" /> Pagamento & Financeiro</h3>
                 <div className="space-y-6">
                    <div><label className="block text-xs font-bold text-taupe-500 uppercase tracking-wider mb-2">Chave Pix Padrão</label><div className="relative"><QrCode className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} /><input type="text" value={pixKey} onChange={(e) => setPixKey(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-200" placeholder="CPF, CNPJ, Email, Telefone ou Aleatória" /></div></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6"><div><label className="block text-xs font-bold text-taupe-500 uppercase tracking-wider mb-2">Máx. Parcelas</label><input type="number" value={maxInstallments} onChange={(e) => setMaxInstallments(Number(e.target.value))} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2" /></div><div><label className="block text-xs font-bold text-taupe-500 uppercase tracking-wider mb-2">Taxa de Juros (%)</label><input type="number" value={interestRate} onChange={(e) => setInterestRate(Number(e.target.value))} className="w-full px-4 py-3 bg-gray-50 border border-cream-200 rounded-xl focus:outline-none focus:ring-2" /></div></div>
                    <div><label className="block text-xs font-bold text-taupe-500 uppercase tracking-wider mb-2">Cobrar juros a partir da parcela:</label><input type="number" value={interestStart} onChange={(e) => setInterestStart(Number(e.target.value))} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2" /></div>
                 </div>
               </div>

               <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 mb-6">
                 <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2"><CalendarDays className="text-blue-500" /> Agenda & Horários</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6"><div><label className="block text-xs font-bold text-taupe-500 uppercase tracking-wider mb-2">Abertura</label><input type="time" value={openingTime} onChange={(e) => setOpeningTime(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl" /></div><div><label className="block text-xs font-bold text-taupe-500 uppercase tracking-wider mb-2">Fechamento</label><input type="time" value={closingTime} onChange={(e) => setClosingTime(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl" /></div></div>
                 <div className="space-y-6"><div><label className="block text-xs font-bold text-taupe-500 uppercase tracking-wider mb-2">Intervalo Padrão (minutos)</label><select value={schedulingInterval} onChange={(e) => setSchedulingInterval(Number(e.target.value))} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl"><option value={15}>15 minutos</option><option value={30}>30 minutos</option><option value={45}>45 minutos</option><option value={60}>1 hora</option></select></div><div><label className="block text-xs font-bold text-taupe-500 uppercase tracking-wider mb-2">Alerta de Atendimento (min antes)</label><input type="number" value={appointmentAlertTime} onChange={(e) => setAppointmentAlertTime(Number(e.target.value))} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl" /></div></div>
               </div>
               
               <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 mb-6">
                 <div className="flex justify-between items-center mb-6">
                   <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2"><Package className="text-blue-500" /> Estoque</h3>
                   <button onClick={() => setStockEnabled(!stockEnabled)} className={`w-12 h-6 rounded-full p-1 transition-colors ${stockEnabled ? 'bg-blue-500' : 'bg-gray-200'}`}>
                     <div className={`w-4 h-4 rounded-full bg-white transition-transform ${stockEnabled ? 'translate-x-6' : ''}`} />
                   </button>
                 </div>

                 {stockEnabled && (
                    <div className="space-y-6 animate-in slide-in-from-top-2 duration-300">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-taupe-500 uppercase tracking-wider mb-2">WhatsApp para Alertas</label>
                                <div className="relative">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input 
                                        type="tel" 
                                        value={stockWhatsApp} 
                                        onChange={(e) => setStockWhatsApp(e.target.value)}
                                        placeholder="(00) 00000-0000"
                                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-taupe-500 uppercase tracking-wider mb-2">Dia do Mês (Relatório)</label>
                                <div className="relative">
                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <select 
                                        value={stockReportDay} 
                                        onChange={(e) => setStockReportDay(Number(e.target.value))}
                                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 appearance-none"
                                    >
                                        {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                                            <option key={day} value={day}>Todo dia {day}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                 )}
               </div>

               {currentCompany.plan !== 'ESSENTIAL' && (
                 <>
                  <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 mb-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2"><Tag className="text-purple-500" /> Promoções</h3>
                      <button onClick={() => setPromotionsEnabled(!promotionsEnabled)} className={`w-12 h-6 rounded-full p-1 transition-colors ${promotionsEnabled ? 'bg-purple-500' : 'bg-gray-200'}`}>
                        <div className={`w-4 h-4 rounded-full bg-white transition-transform ${promotionsEnabled ? 'translate-x-6' : ''}`} />
                      </button>
                    </div>
                  </div>

                  <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 mb-6">
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2"><Heart className="text-rose-500" /> Programa de Fidelidade</h3>
                        <button onClick={() => setLoyaltyEnabled(!loyaltyEnabled)} className={`w-12 h-6 rounded-full p-1 transition-colors ${loyaltyEnabled ? 'bg-rose-500' : 'bg-gray-200'}`}>
                           <div className={`w-4 h-4 rounded-full bg-white transition-transform ${loyaltyEnabled ? 'translate-x-6' : ''}`} />
                        </button>
                      </div>
                      {loyaltyEnabled && <div className="space-y-6"><div><label className="block text-xs font-bold text-taupe-500 uppercase tracking-wider mb-2">Atendimentos Meta</label><input type="number" value={loyaltyServiceGoal} onChange={(e) => setLoyaltyServiceGoal(Number(e.target.value))} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl" placeholder="Ex: 10" /></div></div>}
                  </div>

                  {(currentCompany.plan === 'PREMIUM' || currentCompany.plan === 'PROFESSIONAL') && (
                    <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 mb-6">
                      <div className="flex justify-between items-center">
                        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2"><ShoppingBag className="text-pink-500" /> Loja</h3>
                        <button onClick={() => setStoreEnabled(!storeEnabled)} className={`w-12 h-6 rounded-full p-1 transition-colors ${storeEnabled ? 'bg-pink-500' : 'bg-gray-200'}`}>
                          <div className={`w-4 h-4 rounded-full bg-white transition-transform ${storeEnabled ? 'translate-x-6' : ''}`} />
                        </button>
                      </div>
                    </div>
                  )}

                  {(currentCompany.plan === 'PROFESSIONAL' || currentCompany.plan === 'PREMIUM') && (
                    <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 mb-6">
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2"><Users className="text-sky-500" /> Usuários Da Empresa</h3>
                        <button onClick={() => setCompanyUsersEnabled(!companyUsersEnabled)} className={`w-12 h-6 rounded-full p-1 transition-colors ${companyUsersEnabled ? 'bg-sky-500' : 'bg-gray-200'}`}>
                          <div className={`w-4 h-4 rounded-full bg-white transition-transform ${companyUsersEnabled ? 'translate-x-6' : ''}`} />
                        </button>
                      </div>

                      {companyUsersEnabled && (
                        <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                           <div className="flex justify-between items-center bg-gray-50 p-4 rounded-2xl border border-gray-100">
                               <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{companyUsers.length} Usuários ativos</span>
                               <button onClick={() => { setEditingUser(null); setIsUserModalOpen(true); }} className="p-2 bg-sky-500 text-white rounded-xl hover:bg-sky-600 transition-all shadow-md shadow-sky-100"><UserPlus size={18} /></button>
                           </div>
                           <div className="space-y-2">
                               {companyUsers.map(u => (
                                   <div key={u.id} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl hover:border-sky-200 transition-all group">
                                       <div className="flex items-center gap-4">
                                           <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${(u.username.toLowerCase().trim() === 'jeff@gmail.com' || u.isMaster || u.neverExpires) ? 'bg-gradient-to-tr from-amber-400 via-purple-600 to-pink-500 text-white shadow-sm' : u.role === 'ADMIN' ? 'bg-amber-100 text-amber-600' : 'bg-sky-100 text-sky-600'}`}>
                                               {u.role === 'ADMIN' ? <Crown size={18} /> : <UserIcon size={18} />}
                                           </div>
                                           <div>
                                               <div className="text-sm font-bold text-gray-800 flex items-center gap-2">
                                                   <span>{u.name}</span>
                                                   {(u.username.toLowerCase().trim() === 'jeff@gmail.com' || u.isMaster || u.neverExpires) && (
                                                       <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[9px] font-black rounded-full uppercase tracking-wider">
                                                           Sem Expiração
                                                       </span>
                                                   )}
                                               </div>
                                               <div className="text-[10px] text-gray-400 font-medium uppercase tracking-tight">{u.username} • {(u.username.toLowerCase().trim() === 'jeff@gmail.com' || u.isMaster || u.neverExpires) ? 'ADMIN MASTER' : u.role}</div>
                                           </div>
                                       </div>
                                       <div className="flex items-center gap-1">
                                           {u.role !== 'ADMIN' && (
                                               <>
                                                   <button onClick={() => { setEditingUser(u); setIsUserModalOpen(true); }} className="p-2 text-gray-400 hover:text-sky-600 transition-colors"><Edit size={16} /></button>
                                                   <button onClick={() => setItemToDelete({ id: u.id, type: 'COMPANY_USER', name: u.name })} className="p-2 text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                                               </>
                                           )}
                                           {u.role === 'ADMIN' && (
                                               <div className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase ${(u.username.toLowerCase().trim() === 'jeff@gmail.com' || u.isMaster || u.neverExpires) ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-sm' : 'bg-amber-50 text-amber-600'}`}>
                                                   {(u.username.toLowerCase().trim() === 'jeff@gmail.com' || u.isMaster || u.neverExpires) ? 'Master Vitalício' : 'Administrador'}
                                               </div>
                                           )}
                                       </div>
                                   </div>
                               ))}
                           </div>
                        </div>
                      )}
                    </div>
                  )}
                 </>
               )}

               {/* Card de Diagnóstico & Status de Conexão com o Banco de Dados - Visível exclusivamente para o Administrador Master */}
               {isMasterAdmin && (
                 <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-white rounded-3xl p-6 md:p-8 shadow-sm border border-emerald-200 mb-6">
                   <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                     <div>
                       <div className="flex items-center gap-2.5 mb-1">
                         <span className="p-2.5 bg-emerald-600 text-white rounded-xl shadow-xs">
                           <Database size={20} />
                         </span>
                         <div>
                           <h3 className="text-lg font-bold text-emerald-950 flex items-center gap-2">
                             <span>Banco de Dados Conectado</span>
                             <span className="text-[10px] bg-emerald-100 text-emerald-800 font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                               LocalStorage Íntegro
                             </span>
                           </h3>
                           <span className="text-xs font-semibold text-emerald-700">16 Tabelas Ativas • Persistência em Tempo Real</span>
                         </div>
                       </div>
                       <p className="text-xs text-emerald-800 mt-2 max-w-xl leading-relaxed">
                         Clientes, serviços, agendamentos, profissionais, vendas, fidelidade, promoções e configurações são salvos instantaneamente no armazenamento seguro do navegador. Clique para auditar as 16 tabelas e exportar ou restaurar backups.
                       </p>
                     </div>

                     <button
                       type="button"
                       onClick={() => setIsDbStatusModalOpen(true)}
                       className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm hover:shadow transition-all flex items-center gap-2 shrink-0 cursor-pointer"
                     >
                       <Database size={16} />
                       <span>Inspecionar Banco</span>
                     </button>
                   </div>
                 </div>
               )}

               <div className="flex justify-end"><button onClick={handleSaveSettings} className="px-6 py-3 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-black transition-colors flex items-center gap-2"><Save size={18} /> Salvar Alterações</button></div>
             </div>
           )}
        </main>
      </div>

      <ProductForm isOpen={isProductModalOpen} onClose={() => setIsProductModalOpen(false)} onSave={handleSaveProduct} initialData={editingProduct} itemType={currentView === ViewState.STORE || currentView === ViewState.STOCK ? 'PRODUCT' : 'SERVICE'} availableServices={companyServices} defaultSubtype={serviceTab} categories={companyCategories} purpose={currentView === ViewState.STORE ? 'SALE' : 'STOCK'} />
      <ClientForm isOpen={isClientModalOpen} onClose={() => setIsClientModalOpen(false)} onSave={handleSaveClient} initialData={editingClient} />
      <ProfessionalForm isOpen={isProfessionalModalOpen} onClose={() => setIsProfessionalModalOpen(false)} onSave={handleSaveProfessional} initialData={editingProfessional} specialties={companySpecialties} />
      <SpecialtyModal isOpen={isSpecialtyModalOpen} onClose={() => setIsSpecialtyModalOpen(false)} specialties={companySpecialties} onAdd={handleAddSpecialty} onDelete={handleDeleteSpecialty} />
      <ClientSelector isOpen={isClientSelectorOpen} onClose={() => setIsClientSelectorOpen(false)} onSelect={handleClientSelect} clients={companyClients} />
      <SalesModal isOpen={isSalesModalOpen} onClose={() => { setIsSalesModalOpen(false); setSaleClient(null); if (isPackagePaymentFlow) setIsPackagePaymentFlow(false); }} onFinish={handleFinishSale} client={saleClient} products={companyStoreItems} maxInstallments={maxInstallments} pixKey={pixKey} interestRate={interestRate} interestStart={interestStart} initialCart={initialCart} promotions={companyPromotions} />
      <AppointmentModal isOpen={isAppointmentModalOpen} onClose={() => { setIsAppointmentModalOpen(false); setAppointmentClient(null); setAppointmentPreSelection(undefined); setFixedService(null); setIsNextSessionMode(false); setIsRenewalMode(false); setRewardDetails(null); }} onSave={handleSaveAppointment} client={appointmentClient} services={companyServices} appointments={companyAppointments} settings={{ openingTime, closingTime, interval: schedulingInterval }} initialDate={appointmentPreSelection?.date} initialTime={appointmentPreSelection?.time} fixedService={fixedService} promotions={companyPromotions} />
      <LoyaltyRewardModal isOpen={!!rewardDetails && false} onClose={() => {}} client={null} products={companyProducts} onRegisterRedemption={handleRegisterRedemption} />
    </div>
  );
};

export default App;