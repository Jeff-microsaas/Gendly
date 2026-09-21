import React from 'react';
import { 
  Check, Calendar, TrendingUp, Users, ShoppingBag, Star, 
  ShieldCheck, Zap, Heart, ArrowRight, ListOrdered, 
  MessageCircle, Layers, Package, Tag, Trophy, MousePointer2, Cake
} from 'lucide-react';
import { PlanType } from '../types';

interface LandingPageProps {
  onStart: (mode: 'login' | 'register', plan?: PlanType) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  const plans = [
    {
      id: 'ESSENTIAL' as PlanType,
      name: 'Essencial',
      price: '14,99',
      description: 'Ideal para quem está começando e busca organização básica.',
      features: [
        'Agenda (até 60 agend. / mês)',
        'Clientes (até 30 clientes)',
        'Até 5 Serviços e 5 Pacotes',
        '1 Profissional',
        'Financeiro Completo',
        'Fila de espera (até 3 pessoas)',
        'Estoque Inteligente (até 5 itens)',
        'Aniversariantes'
      ],
      highlight: false,
      buttonText: 'Começar agora',
      customButtonStyle: 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-100 hover:shadow-blue-200'
    },
    {
      id: 'PROFESSIONAL' as PlanType,
      name: 'Profissional',
      price: '24,99',
      description: 'O melhor custo-benefício para clínicas e estúdios em crescimento.',
      features: [
        'Agenda (até 200 agend. / mês)',
        'Clientes (até 100 clientes)',
        'Serviços e Pacotes Ilimitados',
        'Cadastro de até 3 Profissionais',
        'Financeiro Completo',
        'Fila de espera Ilimitada',
        'Estoque Inteligente Ilimitado',
        'Aniversariantes, Fidelidade e Promoções',
        'Módulo Loja (até 3 produtos)',
        'Criar Usuário (até 2 usuários)'
      ],
      highlight: true,
      buttonText: 'Assinar Profissional',
      customButtonStyle: 'bg-purple-600 text-white shadow-purple-100 hover:bg-purple-700'
    },
    {
      id: 'PREMIUM' as PlanType,
      name: 'Premium',
      price: '32,99',
      description: 'Gestão de alta performance para quem não aceita limites.',
      features: [
        'Tudo do Profissional',
        'Agenda (até 500 agend. / mês)',
        'Clientes (até 500 clientes)',
        'Cadastro de até 10 Profissionais',
        'Módulo Loja (até 10 produtos)',
        'Multi-Empresas',
        'Criar Usuário (até 5 usuários)'
      ],
      highlight: false,
      buttonText: 'Assinar Premium',
      customButtonStyle: 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-100 hover:shadow-emerald-200 ring-4 ring-emerald-50'
    }
  ];

  const allFeatures = [
    {
      title: "Agenda Inteligente",
      desc: "Agendamentos em segundos com interface fluida. Organize seu tempo de forma profissional e evite choques de horários.",
      icon: Calendar,
      color: "text-blue-500",
      bg: "bg-blue-50"
    },
    {
      title: "Fila de Espera",
      desc: "Nunca mais perca uma venda. O sistema avisa automaticamente o próximo da fila quando um horário for cancelado.",
      icon: ListOrdered,
      color: "text-orange-500",
      bg: "bg-orange-50"
    },
    {
      title: "WhatsApp Integrated",
      desc: "Notificações automáticas de agendamento e lembretes de cobrança direto no celular do cliente para reduzir faltas.",
      icon: MessageCircle,
      color: "text-emerald-500",
      bg: "bg-emerald-50"
    },
    {
      title: "Serviços & Pacotes",
      desc: "Gerencie sessões de pacotes promocionais com baixa automática. Tenha controle total de quantas sessões ainda restam.",
      icon: Layers,
      color: "text-purple-500",
      bg: "bg-purple-50"
    },
    {
      title: "Financeiro Robusto",
      desc: "Controle de fluxo de caixa, parcelamentos e comissões. Saiba exatamente quanto seu negócio fatura por dia, semana e mês.",
      icon: TrendingUp,
      color: "text-indigo-500",
      bg: "bg-indigo-50"
    },
    {
      title: "Módulo Loja",
      desc: "Transforme sua recepção em um ponto de venda lucrativo. Gerencie a venda de produtos e kits de forma independente.",
      icon: ShoppingBag,
      color: "text-pink-500",
      bg: "bg-pink-50"
    },
    {
      title: "Promoções Turbo",
      desc: "Crie ofertas exclusivas para itens parados ou datas especiais e envie para sua base de clientes com um clique.",
      icon: Tag,
      color: "text-rose-500",
      bg: "bg-rose-50"
    },
    {
      title: "Programa Fidelidade",
      desc: "Recompense quem sempre volta. Pontuação automática que gera prêmios e mantém seus clientes sempre por perto.",
      icon: Trophy,
      color: "text-yellow-600",
      bg: "bg-yellow-50"
    },
    {
      title: "Estoque Inteligente",
      desc: "Baixa automática de materiais conforme o uso nos procedimentos. Saiba o que comprar antes mesmo de acabar.",
      icon: Package,
      color: "text-cyan-600",
      bg: "bg-cyan-50"
    },
    {
      title: "Parabenize seu clientes",
      desc: "O Gendly lembra você sobre o dia de aniversário de seus clientes, fortalecendo o vínculo e gerando novas visitas.",
      icon: Cake,
      color: "text-pink-600",
      bg: "bg-pink-50"
    }
  ];

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-[100] border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-black gradient-text tracking-tighter">Gendly</h1>
          </div>
          <div className="flex items-center gap-3 md:gap-6">
            <button 
              onClick={() => onStart('login')}
              className="text-xs md:text-sm font-bold text-gray-500 hover:text-purple-600 transition-colors whitespace-nowrap"
            >
              Já sou parceiro
            </button>
            <button 
              onClick={() => onStart('login')}
              className="bg-gray-900 text-white px-4 md:px-6 py-2 md:py-2.5 rounded-full text-xs md:text-sm font-bold hover:bg-black transition-all shadow-lg shadow-gray-200"
            >
              Acessar Sistema
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 md:pt-48 pb-20 px-6 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-5xl bg-purple-50/50 rounded-full blur-[120px] -z-10"></div>
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-[10px] md:text-xs font-black uppercase tracking-widest mb-8 animate-bounce">
            <Zap size={14} fill="currentColor" />
            <span>Sistema Nº1 para Clínicas de Estética e Salões</span>
          </div>
          <h2 className="text-4xl md:text-7xl font-black text-gray-900 tracking-tight leading-[1.05] mb-8">
            Domine sua Agenda e Multiplique seu <span className="gradient-text">Lucro.</span>
          </h2>
          <p className="text-lg md:text-xl text-gray-500 mb-10 max-w-3xl mx-auto leading-relaxed font-medium">
            O Gendly é a solução MicroSaaS definitiva. Do agendamento inteligente à fidelização automática, tenha o controle total do seu negócio em um único lugar.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={() => onStart('register', 'PROFESSIONAL')}
              className="w-full sm:w-auto px-10 py-5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-purple-200 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 group"
            >
              Começar Agora
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={() => {
                document.getElementById('funcionalidades')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full sm:w-auto px-10 py-5 bg-white text-gray-700 border-2 border-gray-100 rounded-2xl font-bold text-lg hover:bg-gray-50 transition-all"
            >
              Conhecer Funcionalidades
            </button>
          </div>
          
          <div className="mt-16 flex flex-wrap justify-center items-center gap-8 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
             <div className="flex items-center gap-2 font-bold"><ShieldCheck size={20}/> 100% Seguro</div>
             <div className="flex items-center gap-2 font-bold"><Check size={20}/> Sem fidelidade</div>
             <div className="flex items-center gap-2 font-bold"><Users size={20}/> +1.200 Profissionais</div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="funcionalidades" className="py-24 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-5xl font-black text-gray-900">Tudo em um único lugar</h2>
            <p className="text-gray-500 max-w-2xl mx-auto font-medium">Esqueça as planilhas e o papel. Transforme seu negócio com ferramentas desenvolvidas para quem vive a estética todos os dias.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {allFeatures.map((feat, i) => (
              <div key={i} className="bg-white p-8 rounded-[2rem] border border-gray-100 hover:border-purple-200 shadow-sm hover:shadow-xl transition-all group">
                <div className={`w-14 h-14 ${feat.bg} ${feat.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feat.icon size={28} strokeWidth={2.5} />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-800">{feat.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed font-medium">{feat.desc}</p>
              </div>
            ))}
          </div>
          
          <div className="mt-16 bg-gradient-to-br from-gray-900 to-black rounded-[2.5rem] p-8 md:p-12 text-white relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px]"></div>
             <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div>
                   <h3 className="text-3xl md:text-4xl font-black mb-6 leading-tight">Por que escolher o <span className="text-purple-400">Gendly</span> para sua gestão?</h3>
                   <ul className="space-y-4">
                      <li className="flex items-center gap-3"><Check className="text-emerald-400" /> Interface rápida e fácil de usar</li>
                      <li className="flex items-center gap-3"><Check className="text-emerald-400" /> Acesso de qualquer lugar (Celular, Tablet ou PC)</li>
                      <li className="flex items-center gap-3"><Check className="text-emerald-400" /> Desenvolvido com foco em seu sucesso.</li>
                      <li className="flex items-center gap-3"><Check className="text-emerald-400" /> Backup automático de todos os seus dados</li>
                   </ul>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/10 text-center">
                   <Star className="text-yellow-400 mx-auto mb-4" size={48} fill="currentColor" />
                   <p className="text-lg italic font-medium mb-6">"O Gendly mudou minha forma de trabalhar. Meus clientes adoram os lembretes e eu nunca mais me perdi com os pacotes."</p>
                   <div className="font-bold text-purple-300">— Mariana Costa, Esteticista</div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="planos" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-4">O plano perfeito para você</h2>
            <p className="text-gray-500 font-medium">Invista no seu crescimento com planos que cabem no seu bolso.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, idx) => (
              <div 
                key={idx} 
                className={`relative p-8 rounded-[3rem] border transition-all ${
                  plan.highlight 
                  ? 'border-purple-200 bg-white shadow-2xl scale-105 z-10' 
                  : 'border-gray-100 bg-white hover:border-purple-100'
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
                    Recomendado
                  </div>
                )}
                <h4 className="text-2xl font-bold mb-2">{plan.name}</h4>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-sm font-bold text-gray-400">R$</span>
                  <span className="text-5xl font-black tracking-tighter">{plan.price}</span>
                  <span className="text-sm font-bold text-gray-400">/mês</span>
                </div>
                <p className="text-sm text-gray-400 font-medium mb-8 leading-relaxed">
                  {plan.description}
                </p>
                <div className="space-y-4 mb-10">
                  {plan.features.map((feat, fidx) => (
                    <div key={fidx} className="flex items-start gap-3">
                      <div className="bg-emerald-100 text-emerald-600 p-0.5 rounded-full mt-0.5 shrink-0">
                        <Check size={14} strokeWidth={4} />
                      </div>
                      <span className="text-sm font-bold text-gray-600">{feat}</span>
                    </div>
                  ))}
                </div>
                <button 
                  onClick={() => onStart('register', plan.id)}
                  className={`w-full py-5 rounded-2xl font-black transition-all shadow-lg active:scale-95 uppercase tracking-widest text-xs ${plan.customButtonStyle}`}
                >
                  {plan.buttonText}
                </button>
              </div>
            ))}
          </div>
          
          <div className="mt-20 text-center">
             <div className="inline-flex items-center gap-6 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="flex items-center gap-2">
                   <ShieldCheck className="text-emerald-500" size={24} />
                   <span className="text-sm font-bold text-gray-700">Pagamento 100% Seguro</span>
                </div>
                <div className="w-px h-6 bg-gray-200"></div>
                <div className="flex items-center gap-2">
                   <Star className="text-yellow-500" size={24} fill="currentColor" />
                   <span className="text-sm font-bold text-gray-700">Satisfação Garantida</span>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-gray-100 bg-gray-50/30">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="text-center md:text-left">
            <h2 className="text-3xl font-black gradient-text mb-4">Gendly</h2>
            <p className="text-sm text-gray-500 font-medium leading-relaxed max-w-sm">A plataforma completa para gestão de clínicas e profissionais da beleza de todo o Brasil.</p>
          </div>
          <div className="flex flex-col items-center md:items-end gap-6">
            <div className="flex gap-8 text-sm font-bold text-gray-400">
               <a href="#" className="hover:text-purple-600 transition-colors">Privacidade</a>
               <a href="#" className="hover:text-purple-600 transition-colors">Termos</a>
               <a href="#" className="hover:text-purple-600 transition-colors">Suporte</a>
            </div>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">© 2024 Gendly App. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};