import { 
  User, 
  Company, 
  Client, 
  Product, 
  Category, 
  Sale, 
  Appointment, 
  Professional, 
  Specialty, 
  QueueItem, 
  LoyaltyRedemption, 
  Promotion, 
  UserPermissions,
  PlanType 
} from '../types';

export const FULL_PERMISSIONS: UserPermissions = {
  financial: true,
  settings: true,
  stock: true,
  store: true,
  promotions: true,
  loyalty: true
};

export const EMPTY_PERMISSIONS: UserPermissions = {
  financial: false,
  settings: false,
  stock: false,
  store: false,
  promotions: false,
  loyalty: false
};

// --- DADOS PADRÃO PARA INICIALIZAÇÃO DO BANCO ---

export const COMPANY_STUDIO_ALANA: Company = {
  id: 'studio-alana-moreira',
  name: 'Studio Alana Moreira',
  subName: 'Estética & Beleza Premium',
  logo: 'https://ui-avatars.com/api/?name=Studio+Alana+Moreira&background=fdf4ff&color=9333ea',
  taxId: '22.222.222/0001-22',
  businessType: 'PJ',
  plan: 'PREMIUM',
  neverExpires: true
};

export const INITIAL_COMPANIES: Company[] = [
  COMPANY_STUDIO_ALANA,
  { 
    id: '1', 
    name: 'Studio Beleza Pura', 
    subName: 'Estética & Bem-estar', 
    logo: 'https://ui-avatars.com/api/?name=Studio+Beleza+Pura&background=fce7f3&color=db2777', 
    taxId: '00.000.000/0001-00', 
    businessType: 'PJ', 
    plan: 'PREMIUM', 
    neverExpires: true 
  },
  { 
    id: '2', 
    name: 'Maison D\'Or', 
    subName: 'Hair Stylist', 
    logo: 'https://ui-avatars.com/api/?name=Maison+Dor&background=ffe4e6&color=be123c', 
    taxId: '11.111.111/0001-11', 
    businessType: 'PJ', 
    plan: 'PREMIUM', 
    neverExpires: true 
  },
];

// Administradora solicitada: alaninha@gmail.com / Alaninha@123 (Administradora exclusiva de Studio Alana Moreira, vitalícia sem expiração)
export const ADMIN_ALANINHA: User = {
  id: 'u-alaninha',
  username: 'alaninha@gmail.com',
  password: 'Alaninha@123',
  name: 'Alana Moreira (Administradora)',
  companyId: 'studio-alana-moreira',
  role: 'ADMIN',
  isMaster: false,
  neverExpires: true,
  permissions: FULL_PERMISSIONS
};

export const ADMIN_JEFF: User = {
  id: 'u-jeff',
  username: 'jeff@gmail.com',
  password: '123456',
  name: 'Jeff (Administrador Master)',
  companyId: '1',
  role: 'ADMIN',
  isMaster: true,
  neverExpires: true,
  permissions: FULL_PERMISSIONS
};

export const INITIAL_USERS: User[] = [
  ADMIN_ALANINHA,
  ADMIN_JEFF,
  { id: 'u1', username: 'admin@gendly.com', password: '123', name: 'Studio Beleza Pura', companyId: '1', role: 'ADMIN', permissions: FULL_PERMISSIONS, neverExpires: true }, 
  { id: 'u2', username: 'loja2@gendly.com', password: '123', name: 'Renata Silk', companyId: '2', role: 'ADMIN', permissions: FULL_PERMISSIONS, neverExpires: true },     
];

export const MOCK_CATEGORIES: Category[] = [
  { id: 'cat1', name: 'Cabelos', unit: 'ML', quantity: 500, peopleCount: 5, companyId: '1' },
  { id: 'cat2', name: 'Estética', unit: 'Unidade', quantity: 10, peopleCount: 10, companyId: '1' },
  { id: 'cat3', name: 'Acessórios', unit: 'Unidade', quantity: 1, peopleCount: 1, companyId: '1' },
  { id: 'cat-alana-1', name: 'Estética Facial & Cuidados', unit: 'Unidade', quantity: 20, peopleCount: 20, companyId: 'studio-alana-moreira' },
  { id: 'cat-alana-2', name: 'Home Care', unit: 'Unidade', quantity: 50, peopleCount: 50, companyId: 'studio-alana-moreira' },
];

export const MOCK_PRODUCTS: Product[] = [
  { id: '1', companyId: '1', name: 'Protocolo Glow 24k', price: 450.00, quantity: 12, minQuantity: 5, sku: 'GLW-001', description: 'Tratamento iluminador com partículas de ouro.', image: null, type: 'SERVICE', subtype: 'SINGLE' },
  { id: '2', companyId: '1', name: 'Essência Floral Rose', price: 180.00, quantity: 45, minQuantity: 10, sku: 'FLO-002', description: 'Óleo essencial de rosas para harmonização.', image: null, type: 'SERVICE', subtype: 'SINGLE' },
  { id: '3', companyId: '1', name: 'Corte Bordado', price: 120.00, quantity: 99, minQuantity: 5, sku: 'CRT-005', description: 'Remoção de pontas duplas sem tirar comprimento.', image: null, type: 'SERVICE', subtype: 'SINGLE' },
  { id: '4', companyId: '1', name: 'Pacote Noiva', price: 1500.00, quantity: 10, minQuantity: 2, sku: 'PKG-001', description: 'Dia completo da noiva.', image: null, type: 'SERVICE', subtype: 'PACKAGE', sessionCount: 3, packageItems: ['1', '2'] },
  { id: '5', companyId: '1', name: 'Shampoo Hidratante', price: 45.00, quantity: 3, minQuantity: 5, sku: 'SHP-001', description: 'Shampoo para cabelos secos e danificados.', image: null, type: 'PRODUCT', categoryId: 'cat1', purpose: 'STOCK' },
  { id: '6', companyId: '1', name: 'Kit Manicure', price: 89.90, quantity: 2, minQuantity: 5, sku: 'KIT-002', description: 'Kit completo para unhas profissionais.', image: null, type: 'PRODUCT', categoryId: 'cat2', purpose: 'SALE' },
  // Studio Alana Moreira - Itens Iniciais
  { id: 'prod-alana-1', companyId: 'studio-alana-moreira', name: 'Limpeza de Pele Profunda', price: 180.00, quantity: 99, minQuantity: 5, sku: 'LMP-001', description: 'Higienização profunda com extração, esfoliação e máscara de alta frequência.', image: null, type: 'SERVICE', subtype: 'SINGLE' },
  { id: 'prod-alana-2', companyId: 'studio-alana-moreira', name: 'Design de Sobrancelhas com Henna', price: 65.00, quantity: 99, minQuantity: 5, sku: 'DSG-002', description: 'Mapeamento geométrico facial e aplicação de henna natural.', image: null, type: 'SERVICE', subtype: 'SINGLE' },
  { id: 'prod-alana-3', companyId: 'studio-alana-moreira', name: 'Pacote Revitalização Facial (4 Sessões)', price: 580.00, quantity: 50, minQuantity: 2, sku: 'PKG-ALANA-1', description: 'Tratamento intensivo anti-idade e clareamento.', image: null, type: 'SERVICE', subtype: 'PACKAGE', sessionCount: 4 },
  { id: 'prod-alana-4', companyId: 'studio-alana-moreira', name: 'Sérum Facial Vitamina C 30ml', price: 89.90, quantity: 18, minQuantity: 3, sku: 'SRM-001', description: 'Sérum concentrado antioxidante e iluminador.', image: null, type: 'PRODUCT', categoryId: 'cat-alana-2', purpose: 'SALE' },
  { id: 'prod-alana-5', companyId: 'studio-alana-moreira', name: 'Máscara Hidratante Ouro 24k 500g', price: 140.00, quantity: 6, minQuantity: 2, sku: 'MSK-001', description: 'Insumo de cabine profissional para revitalização.', image: null, type: 'PRODUCT', categoryId: 'cat-alana-1', purpose: 'STOCK' },
];

export const MOCK_CLIENTS: Client[] = [
  { id: '1', companyId: '1', name: 'Carla Dias', nickname: 'Carlinha', whatsapp: '11999999999', birthday: '1995-05-20', avatar: 'https://ui-avatars.com/api/?name=Carla+Dias&background=fee2e2&color=ef4444' },
  { id: '2', companyId: '1', name: 'Ana Souza', nickname: 'Aninha', whatsapp: '11988888888', birthday: new Date().toISOString().split('T')[0], avatar: 'https://ui-avatars.com/api/?name=Ana+Souza&background=dbeafe&color=2563eb' },
  { id: '3', companyId: '1', name: 'Beatriz Silva', nickname: 'Bia', whatsapp: '11977777777', birthday: '1988-03-10', avatar: 'https://ui-avatars.com/api/?name=Beatriz+Silva&background=f3e8ff&color=9333ea' },
  { id: 'cli-alana-1', companyId: 'studio-alana-moreira', name: 'Mariana Duarte', nickname: 'Mari', whatsapp: '11988776655', birthday: '1994-06-12', avatar: 'https://ui-avatars.com/api/?name=Mariana+Duarte&background=fdf4ff&color=9333ea' },
  { id: 'cli-alana-2', companyId: 'studio-alana-moreira', name: 'Fernanda Paes', nickname: 'Fê', whatsapp: '11977665544', birthday: '1990-11-25', avatar: 'https://ui-avatars.com/api/?name=Fernanda+Paes&background=fce7f3&color=db2777' },
];

export const MOCK_SPECIALTIES: Specialty[] = [
  { id: '1', name: 'Cabelo', companyId: '1' },
  { id: '2', name: 'Manicure', companyId: '1' },
  { id: '3', name: 'Estética Facial', companyId: '1' },
  { id: 'spec-alana-1', name: 'Estética & Harmonização Facial', companyId: 'studio-alana-moreira' },
  { id: 'spec-alana-2', name: 'Design de Sobrancelhas & Cílios', companyId: 'studio-alana-moreira' },
];

export const MOCK_PROFESSIONALS: Professional[] = [
  { id: '1', companyId: '1', name: 'Juliana Santos', nickname: 'Ju', whatsapp: '11999990001', specialtyId: '1', avatar: 'https://ui-avatars.com/api/?name=Ju&background=f3e8ff&color=9333ea' },
  { id: '2', companyId: '1', name: 'Priscila Alencar', nickname: 'Pri', whatsapp: '11999990002', specialtyId: '2', avatar: 'https://ui-avatars.com/api/?name=Pri&background=ec4899&color=fff' },
  { id: 'prof-alana-1', companyId: 'studio-alana-moreira', name: 'Alana Moreira', nickname: 'Alana', whatsapp: '11999887766', specialtyId: 'spec-alana-1', avatar: 'https://ui-avatars.com/api/?name=Alana+Moreira&background=fdf4ff&color=9333ea' },
  { id: 'prof-alana-2', companyId: 'studio-alana-moreira', name: 'Camila Rocha', nickname: 'Cami', whatsapp: '11988774433', specialtyId: 'spec-alana-2', avatar: 'https://ui-avatars.com/api/?name=Camila+Rocha&background=fee2e2&color=e11d48' },
];

export const MOCK_SALES: Sale[] = [
  {
    id: 's1',
    clientId: '1',
    companyId: '1',
    date: '2023-10-15',
    total: 450.00,
    paymentType: 'INSTALLMENTS',
    items: [{ productId: '1', quantity: 1, priceAtSale: 450.00 }],
    installments: [
      { number: 1, value: 150.00, dueDate: '2023-11-15', status: 'PAID', paidAt: '2023-11-15' },
      { number: 2, value: 150.00, dueDate: '2023-12-15', status: 'PENDING' },
      { number: 3, value: 150.00, dueDate: '2024-01-15', status: 'PENDING' },
    ]
  },
  {
    id: 's2',
    clientId: '2',
    companyId: '1',
    date: '2023-11-10',
    total: 180.00,
    paymentType: 'INSTALLMENTS',
    items: [{ productId: '2', quantity: 1, priceAtSale: 180.00 }],
    installments: [
      { number: 1, value: 90.00, dueDate: '2023-12-10', status: 'PENDING' },
      { number: 2, value: 90.00, dueDate: '2024-01-10', status: 'PENDING' },
    ]
  }
];

export const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 1,
    companyId: '1',
    time: '09:00',
    rawDate: new Date().toISOString().split('T')[0],
    date: new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' }).replace('.', ''),
    weekday: new Date().toLocaleDateString('pt-BR', { weekday: 'long' }).split('-')[0].toUpperCase(),
    client: 'Carla Dias',
    clientNickname: 'Carlinha',
    avatar: 'https://ui-avatars.com/api/?name=Carla+Dias&background=fee2e2&color=ef4444',
    professional: 'Juliana Santos',
    professionalAvatar: 'https://ui-avatars.com/api/?name=Ju&background=f3e8ff&color=9333ea',
    service: 'Protocolo Glow 24k',
    category: 'SERVIÇO AVULSO',
    status: 'Confirmado',
    canRemind: false
  }
];

export interface StockConsumptionRecord {
  id: string;
  companyId: string;
  appointmentId?: number;
  clientId?: string;
  consumedAt: string;
  items: { productId: string; quantity: number }[];
}

// Chaves das tabelas do banco de dados no storage persistente
export const DB_TABLES = {
  USERS: 'gendly_db_table_users',
  COMPANIES: 'gendly_db_table_companies',
  CLIENTS: 'gendly_db_table_clients',
  PRODUCTS: 'gendly_db_table_products',
  CATEGORIES: 'gendly_db_table_categories',
  SALES: 'gendly_db_table_sales',
  APPOINTMENTS: 'gendly_db_table_appointments',
  PROFESSIONALS: 'gendly_db_table_professionals',
  SPECIALTIES: 'gendly_db_table_specialties',
  ACTIVE_PACKAGES: 'gendly_db_table_active_packages',
  QUEUE: 'gendly_db_table_queue',
  LOYALTY_REDEMPTIONS: 'gendly_db_table_loyalty_redemptions',
  PROMOTIONS: 'gendly_db_table_promotions',
  SETTINGS: 'gendly_db_table_settings',
  TRIAL_REGISTRY: 'gendly_db_table_trial_registry',
  STOCK_CONSUMPTION: 'gendly_db_table_stock_consumption'
} as const;

export interface TableDiagnostic {
  tableName: string;
  displayName: string;
  recordCount: number;
  status: 'Conectado' | 'Ativo' | 'Vazio';
  description: string;
}

// Helpers de Leitura e Escrita Segura
function readTable<T>(key: string, fallback: T): T {
  try {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return fallback;
    }
    const data = localStorage.getItem(key);
    if (!data) return fallback;
    return JSON.parse(data) as T;
  } catch (err) {
    console.warn(`[GendlyDB] Erro ao carregar tabela ${key}:`, err);
    return fallback;
  }
}

function writeTable<T>(key: string, data: T): void {
  try {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return;
    }
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error(`[GendlyDB] Erro ao persistir tabela ${key}:`, err);
  }
}

/**
 * SERVIÇO CENTRAL DE BANCO DE DADOS GENDLY
 * Garante a persistência de dados de todas as telas, entidades e empresas.
 */
export const db = {
  // --- USUÁRIOS ---
  users: {
    getAll(): User[] {
      // Migração de chaves antigas se necessário
      let stored = readTable<User[] | null>(DB_TABLES.USERS, null);
      if (!stored) {
        const legacy = readTable<User[] | null>('gendly_users', null);
        stored = legacy || INITIAL_USERS;
      }

      // Garantir sempre a administradora Alaninha com senha Alaninha@123 vinculada EXCLUSIVAMENTE ao Studio Alana Moreira
      const cleanAlaninha = { ...ADMIN_ALANINHA };
      const cleanJeff = { ...ADMIN_JEFF };

      let list = Array.isArray(stored) ? [...stored] : [...INITIAL_USERS];
      
      // Upsert Alaninha - Administradora exclusiva de Studio Alana Moreira
      const alaninhaIndex = list.findIndex(u => u.username.toLowerCase().trim() === 'alaninha@gmail.com');
      if (alaninhaIndex >= 0) {
        list[alaninhaIndex] = {
          ...list[alaninhaIndex],
          name: 'Alana Moreira (Administradora)',
          companyId: 'studio-alana-moreira',
          password: 'Alaninha@123',
          role: 'ADMIN',
          isMaster: false,
          neverExpires: true,
          permissions: FULL_PERMISSIONS
        };
      } else {
        list.unshift(cleanAlaninha);
      }

      // Upsert Jeff - Master global
      const jeffIndex = list.findIndex(u => u.username.toLowerCase().trim() === 'jeff@gmail.com');
      if (jeffIndex >= 0) {
        list[jeffIndex] = {
          ...list[jeffIndex],
          role: 'ADMIN',
          isMaster: true,
          neverExpires: true,
          permissions: FULL_PERMISSIONS
        };
      } else {
        list.push(cleanJeff);
      }

      writeTable(DB_TABLES.USERS, list);
      return list;
    },
    save(users: User[]): void {
      // Assegura integridade e isolamento de Alaninha e Jeff ao salvar
      const list = users.map(u => {
        if (u.username.toLowerCase().trim() === 'alaninha@gmail.com') {
          return { 
            ...u, 
            name: 'Alana Moreira (Administradora)',
            companyId: 'studio-alana-moreira',
            role: 'ADMIN', 
            isMaster: false, 
            neverExpires: true, 
            permissions: FULL_PERMISSIONS 
          };
        }
        if (u.username.toLowerCase().trim() === 'jeff@gmail.com') {
          return { ...u, role: 'ADMIN', isMaster: true, neverExpires: true, permissions: FULL_PERMISSIONS };
        }
        return u;
      });

      if (!list.some(u => u.username.toLowerCase().trim() === 'alaninha@gmail.com')) {
        list.unshift(ADMIN_ALANINHA);
      }

      writeTable(DB_TABLES.USERS, list);
      writeTable('gendly_users', list); // retrocompatibilidade
    },
    setAll(users: User[]): void {
      this.save(users);
    },
    upsert(user: User): void {
      const all = db.users.getAll();
      const idx = all.findIndex(u => u.id === user.id || u.username.toLowerCase().trim() === user.username.toLowerCase().trim());
      if (idx >= 0) {
        all[idx] = { ...all[idx], ...user };
      } else {
        all.push(user);
      }
      db.users.save(all);
    }
  },

  // --- EMPRESAS ---
  companies: {
    getAll(): Company[] {
      let stored = readTable<Company[] | null>(DB_TABLES.COMPANIES, null);
      if (!stored) {
        const legacy = readTable<Company[] | null>('gendly_companies', null);
        stored = legacy || INITIAL_COMPANIES;
      }
      let list = Array.isArray(stored) && stored.length > 0 ? [...stored] : [...INITIAL_COMPANIES];

      // Assegurar sempre a existência de Studio Alana Moreira com plano PREMIUM e vitalício
      const alanaIndex = list.findIndex(c => c.id === 'studio-alana-moreira' || c.name.toLowerCase().includes('alana moreira'));
      if (alanaIndex >= 0) {
        list[alanaIndex] = {
          ...list[alanaIndex],
          id: 'studio-alana-moreira',
          name: 'Studio Alana Moreira',
          subName: list[alanaIndex].subName || 'Estética & Beleza Premium',
          plan: 'PREMIUM',
          neverExpires: true
        };
      } else {
        list.unshift(COMPANY_STUDIO_ALANA);
      }

      writeTable(DB_TABLES.COMPANIES, list);
      return list;
    },
    save(companies: Company[]): void {
      let list = [...companies];
      const alanaIndex = list.findIndex(c => c.id === 'studio-alana-moreira' || c.name.toLowerCase().includes('alana moreira'));
      if (alanaIndex >= 0) {
        list[alanaIndex] = {
          ...list[alanaIndex],
          id: 'studio-alana-moreira',
          name: 'Studio Alana Moreira',
          plan: 'PREMIUM',
          neverExpires: true
        };
      } else {
        list.unshift(COMPANY_STUDIO_ALANA);
      }
      writeTable(DB_TABLES.COMPANIES, list);
      writeTable('gendly_companies', list);
    },
    setAll(companies: Company[]): void {
      this.save(companies);
    },
    upsert(company: Company): void {
      const all = db.companies.getAll();
      const idx = all.findIndex(c => c.id === company.id);
      if (idx >= 0) {
        all[idx] = { ...all[idx], ...company };
      } else {
        all.push(company);
      }
      db.companies.save(all);
    }
  },

  // --- CLIENTES ---
  clients: {
    getAll(): Client[] {
      let stored = readTable<Client[] | null>(DB_TABLES.CLIENTS, null);
      if (!stored) {
        const legacy = readTable<Client[] | null>('gendly_clients', null);
        stored = legacy || MOCK_CLIENTS;
      }
      let list = Array.isArray(stored) ? [...stored] : [...MOCK_CLIENTS];

      // Se não houver clientes para Studio Alana Moreira, mesclar os clientes padrão
      if (!list.some(c => c.companyId === 'studio-alana-moreira')) {
        const alanaClients = MOCK_CLIENTS.filter(c => c.companyId === 'studio-alana-moreira');
        list = [...alanaClients, ...list];
      }

      writeTable(DB_TABLES.CLIENTS, list);
      return list;
    },
    save(clients: Client[]): void {
      writeTable(DB_TABLES.CLIENTS, clients);
      writeTable('gendly_clients', clients);
    },
    setAll(clients: Client[]): void {
      this.save(clients);
    }
  },

  // --- PRODUTOS E SERVIÇOS ---
  products: {
    getAll(): Product[] {
      let stored = readTable<Product[] | null>(DB_TABLES.PRODUCTS, null);
      if (!stored) {
        const legacy = readTable<Product[] | null>('gendly_products', null);
        stored = legacy || MOCK_PRODUCTS;
      }
      let list = Array.isArray(stored) ? [...stored] : [...MOCK_PRODUCTS];

      // Se não houver produtos para Studio Alana Moreira, mesclar o catálogo padrão
      if (!list.some(p => p.companyId === 'studio-alana-moreira')) {
        const alanaProducts = MOCK_PRODUCTS.filter(p => p.companyId === 'studio-alana-moreira');
        list = [...alanaProducts, ...list];
      }

      writeTable(DB_TABLES.PRODUCTS, list);
      return list;
    },
    save(products: Product[]): void {
      writeTable(DB_TABLES.PRODUCTS, products);
      writeTable('gendly_products', products);
    },
    setAll(products: Product[]): void {
      this.save(products);
    }
  },

  // --- CATEGORIAS ---
  categories: {
    getAll(): Category[] {
      let stored = readTable<Category[] | null>(DB_TABLES.CATEGORIES, null);
      if (!stored) {
        const legacy = readTable<Category[] | null>('gendly_categories', null);
        stored = legacy || MOCK_CATEGORIES;
      }
      let list = Array.isArray(stored) ? [...stored] : [...MOCK_CATEGORIES];

      if (!list.some(cat => cat.companyId === 'studio-alana-moreira')) {
        const alanaCats = MOCK_CATEGORIES.filter(c => c.companyId === 'studio-alana-moreira');
        list = [...alanaCats, ...list];
      }

      writeTable(DB_TABLES.CATEGORIES, list);
      return list;
    },
    save(categories: Category[]): void {
      writeTable(DB_TABLES.CATEGORIES, categories);
      writeTable('gendly_categories', categories);
    },
    setAll(categories: Category[]): void {
      this.save(categories);
    }
  },

  // --- VENDAS & HISTÓRICO ---
  sales: {
    getAll(): Sale[] {
      let stored = readTable<Sale[] | null>(DB_TABLES.SALES, null);
      if (!stored) {
        const legacy = readTable<Sale[] | null>('gendly_sales', null);
        stored = legacy || MOCK_SALES;
      }
      const list = Array.isArray(stored) ? stored : MOCK_SALES;
      writeTable(DB_TABLES.SALES, list);
      return list;
    },
    save(sales: Sale[]): void {
      writeTable(DB_TABLES.SALES, sales);
      writeTable('gendly_sales', sales);
    },
    setAll(sales: Sale[]): void {
      this.save(sales);
    }
  },

  // --- AGENDAMENTOS ---
  appointments: {
    getAll(): Appointment[] {
      let stored = readTable<Appointment[] | null>(DB_TABLES.APPOINTMENTS, null);
      if (!stored) {
        const legacy = readTable<Appointment[] | null>('gendly_appointments', null);
        stored = legacy || INITIAL_APPOINTMENTS;
      }
      const list = Array.isArray(stored) ? stored : INITIAL_APPOINTMENTS;
      writeTable(DB_TABLES.APPOINTMENTS, list);
      return list;
    },
    save(appointments: Appointment[]): void {
      writeTable(DB_TABLES.APPOINTMENTS, appointments);
      writeTable('gendly_appointments', appointments);
    },
    setAll(appointments: Appointment[]): void {
      this.save(appointments);
    }
  },

  // --- PROFISSIONAIS ---
  professionals: {
    getAll(): Professional[] {
      let stored = readTable<Professional[] | null>(DB_TABLES.PROFESSIONALS, null);
      if (!stored) {
        const legacy = readTable<Professional[] | null>('gendly_professionals', null);
        stored = legacy || MOCK_PROFESSIONALS;
      }
      let list = Array.isArray(stored) ? [...stored] : [...MOCK_PROFESSIONALS];

      if (!list.some(p => p.companyId === 'studio-alana-moreira')) {
        const alanaProfs = MOCK_PROFESSIONALS.filter(p => p.companyId === 'studio-alana-moreira');
        list = [...alanaProfs, ...list];
      }

      writeTable(DB_TABLES.PROFESSIONALS, list);
      return list;
    },
    save(professionals: Professional[]): void {
      writeTable(DB_TABLES.PROFESSIONALS, professionals);
      writeTable('gendly_professionals', professionals);
    },
    setAll(professionals: Professional[]): void {
      this.save(professionals);
    }
  },

  // --- ESPECIALIDADES ---
  specialties: {
    getAll(): Specialty[] {
      let stored = readTable<Specialty[] | null>(DB_TABLES.SPECIALTIES, null);
      if (!stored) {
        const legacy = readTable<Specialty[] | null>('gendly_specialties', null);
        stored = legacy || MOCK_SPECIALTIES;
      }
      let list = Array.isArray(stored) ? [...stored] : [...MOCK_SPECIALTIES];

      if (!list.some(s => s.companyId === 'studio-alana-moreira')) {
        const alanaSpecs = MOCK_SPECIALTIES.filter(s => s.companyId === 'studio-alana-moreira');
        list = [...alanaSpecs, ...list];
      }

      writeTable(DB_TABLES.SPECIALTIES, list);
      return list;
    },
    save(specialties: Specialty[]): void {
      writeTable(DB_TABLES.SPECIALTIES, specialties);
      writeTable('gendly_specialties', specialties);
    },
    setAll(specialties: Specialty[]): void {
      this.save(specialties);
    }
  },

  // --- PACOTES ATIVOS ---
  packages: {
    getAll(): any[] {
      const list = readTable<any[]>(DB_TABLES.ACTIVE_PACKAGES, []);
      return Array.isArray(list) ? list : [];
    },
    save(packages: any[]): void {
      writeTable(DB_TABLES.ACTIVE_PACKAGES, packages);
      writeTable('gendly_active_packages', packages);
    },
    setAll(packages: any[]): void {
      this.save(packages);
    }
  },

  get activePackages() {
    return this.packages;
  },

  // --- FILA DE ATENDIMENTO ---
  queue: {
    getAll(): QueueItem[] {
      const list = readTable<QueueItem[]>(DB_TABLES.QUEUE, []);
      return Array.isArray(list) ? list : [];
    },
    save(queue: QueueItem[]): void {
      writeTable(DB_TABLES.QUEUE, queue);
      writeTable('gendly_queue', queue);
    },
    setAll(queue: QueueItem[]): void {
      this.save(queue);
    }
  },

  // --- PROGRAMA DE FIDELIDADE ---
  loyalty: {
    getAll(): LoyaltyRedemption[] {
      const list = readTable<LoyaltyRedemption[]>(DB_TABLES.LOYALTY_REDEMPTIONS, []);
      return Array.isArray(list) ? list : [];
    },
    save(items: LoyaltyRedemption[]): void {
      writeTable(DB_TABLES.LOYALTY_REDEMPTIONS, items);
      writeTable('gendly_loyalty_redemptions', items);
    },
    setAll(items: LoyaltyRedemption[]): void {
      this.save(items);
    }
  },

  get loyaltyRedemptions() {
    return this.loyalty;
  },

  // --- PROMOÇÕES ---
  promotions: {
    getAll(): Promotion[] {
      const list = readTable<Promotion[]>(DB_TABLES.PROMOTIONS, []);
      return Array.isArray(list) ? list : [];
    },
    save(promotions: Promotion[]): void {
      writeTable(DB_TABLES.PROMOTIONS, promotions);
      writeTable('gendly_promotions', promotions);
    },
    setAll(promotions: Promotion[]): void {
      this.save(promotions);
    }
  },

  // --- CONSUMO DE ESTOQUE ---
  stockConsumption: {
    getAll(): StockConsumptionRecord[] {
      const list = readTable<StockConsumptionRecord[]>(DB_TABLES.STOCK_CONSUMPTION, []);
      return Array.isArray(list) ? list : [];
    },
    save(items: StockConsumptionRecord[]): void {
      writeTable(DB_TABLES.STOCK_CONSUMPTION, items);
      writeTable('gendly_stock_consumption', items);
    },
    setAll(items: StockConsumptionRecord[]): void {
      this.save(items);
    },
    add(record: StockConsumptionRecord): void {
      const all = db.stockConsumption.getAll();
      all.unshift(record);
      db.stockConsumption.save(all);
    }
  },

  // --- CONFIGURAÇÕES DE EMPRESA ---
  settings: {
    get(companyId: string): any {
      const allSettings = readTable<Record<string, any>>(DB_TABLES.SETTINGS, {});
      if (allSettings[companyId]) return allSettings[companyId];

      // Fallback para chave isolada legada
      const legacy = readTable<any>(`gendly_settings_${companyId}`, null);
      if (legacy) {
        allSettings[companyId] = legacy;
        writeTable(DB_TABLES.SETTINGS, allSettings);
        return legacy;
      }

      // Configuração padrão completa e vitalícia para Studio Alana Moreira
      if (companyId === 'studio-alana-moreira') {
        const alanaDefaults = {
          openingTime: '08:00',
          closingTime: '20:00',
          schedulingInterval: 30,
          appointmentAlertTime: 10,
          pixKey: 'alaninha@gmail.com',
          maxInstallments: 12,
          interestRate: 0,
          interestStart: 13,
          loyaltyEnabled: true,
          promotionsEnabled: true,
          storeEnabled: true,
          stockEnabled: true,
          companyUsersEnabled: true,
          stockWhatsApp: '',
          stockReportDay: 1,
          loyaltyServiceGoal: 10,
          reminderEnabled: true,
          lowStockAlert: true,
          birthdayAlert: true
        };
        allSettings['studio-alana-moreira'] = alanaDefaults;
        writeTable(DB_TABLES.SETTINGS, allSettings);
        writeTable(`gendly_settings_${companyId}`, alanaDefaults);
        return alanaDefaults;
      }

      return null;
    },
    set(companyId: string, settingsData: any): void {
      const allSettings = readTable<Record<string, any>>(DB_TABLES.SETTINGS, {});
      allSettings[companyId] = { ...(allSettings[companyId] || {}), ...settingsData };
      writeTable(DB_TABLES.SETTINGS, allSettings);
      writeTable(`gendly_settings_${companyId}`, allSettings[companyId]);
    }
  },

  // --- REGISTRO DE TRIALS (ANTI-FRAUDE) ---
  trialRegistry: {
    getAll(): any[] {
      let stored = readTable<any[] | null>(DB_TABLES.TRIAL_REGISTRY, null);
      if (!stored) {
        stored = readTable<any[]>('gendly_trial_registry', []);
      }
      return Array.isArray(stored) ? stored : [];
    },
    save(registry: any[]): void {
      writeTable(DB_TABLES.TRIAL_REGISTRY, registry);
      writeTable('gendly_trial_registry', registry);
    },
    add(entry: { taxId: string; email: string; trialStartDate: string }): void {
      const current = db.trialRegistry.getAll();
      current.push(entry);
      db.trialRegistry.save(current);
    }
  },

  // --- DIAGNÓSTICO E INTEGRIDADE DO BANCO ---
  verifyDatabaseIntegrity(): TableDiagnostic[] {
    return [
      {
        tableName: 'users',
        displayName: 'Usuários & Permissões',
        recordCount: db.users.getAll().length,
        status: 'Conectado',
        description: 'Credenciais de administradores (Alaninha, Jeff, gerentes) e níveis de acesso.'
      },
      {
        tableName: 'companies',
        displayName: 'Empresas (Multi-Tenancy)',
        recordCount: db.companies.getAll().length,
        status: 'Conectado',
        description: 'Unidades e empresas cadastradas com isolamento de dados por unidade.'
      },
      {
        tableName: 'clients',
        displayName: 'Cadastro de Clientes',
        recordCount: db.clients.getAll().length,
        status: 'Conectado',
        description: 'Fichas completas de clientes com WhatsApp, foto, apelido e data de nascimento.'
      },
      {
        tableName: 'products',
        displayName: 'Produtos & Serviços',
        recordCount: db.products.getAll().length,
        status: 'Conectado',
        description: 'Catálogo de serviços avulsos, pacotes de sessões e produtos de estoque e venda.'
      },
      {
        tableName: 'categories',
        displayName: 'Categorias de Estoque',
        recordCount: db.categories.getAll().length,
        status: 'Conectado',
        description: 'Categorização de insumos por unidade de medida (ML, Litros, Kg, Unidade).'
      },
      {
        tableName: 'sales',
        displayName: 'Vendas & Financeiro',
        recordCount: db.sales.getAll().length,
        status: 'Conectado',
        description: 'Registros de faturamento, parcelas a receber, juros, status de pagamento e histórico.'
      },
      {
        tableName: 'appointments',
        displayName: 'Agenda & Atendimentos',
        recordCount: db.appointments.getAll().length,
        status: 'Conectado',
        description: 'Agendamentos organizados por dia, profissional, horário e status de confirmação.'
      },
      {
        tableName: 'professionals',
        displayName: 'Equipe de Profissionais',
        recordCount: db.professionals.getAll().length,
        status: 'Conectado',
        description: 'Membros da equipe com especialidade vinculada e dados de contato.'
      },
      {
        tableName: 'specialties',
        displayName: 'Especialidades',
        recordCount: db.specialties.getAll().length,
        status: 'Conectado',
        description: 'Habilidades profissionais como Cabelo, Manicure, Estética e Procedimentos.'
      },
      {
        tableName: 'active_packages',
        displayName: 'Controle de Pacotes',
        recordCount: db.packages.getAll().length,
        status: 'Conectado',
        description: 'Sessões contratadas por clientes e contagem regressiva de utilizações.'
      },
      {
        tableName: 'queue',
        displayName: 'Fila de Espera',
        recordCount: db.queue.getAll().length,
        status: 'Conectado',
        description: 'Fila dinâmica de clientes aguardando atendimento ou encaixe de horário.'
      },
      {
        tableName: 'loyalty_redemptions',
        displayName: 'Programa de Fidelidade',
        recordCount: db.loyalty.getAll().length,
        status: 'Conectado',
        description: 'Metas atingidas e cupons/recompensas geradas para clientes fiéis.'
      },
      {
        tableName: 'promotions',
        displayName: 'Campanhas & Promoções',
        recordCount: db.promotions.getAll().length,
        status: 'Conectado',
        description: 'Ofertas com preço promocional, data limite e clientes-alvo selecionados.'
      },
      {
        tableName: 'settings',
        displayName: 'Configurações por Empresa',
        recordCount: Object.keys(readTable<Record<string, any>>(DB_TABLES.SETTINGS, {})).length,
        status: 'Conectado',
        description: 'Horários de abertura, chave Pix, juros, parcelas e módulos habilitados.'
      },
      {
        tableName: 'stock_consumption',
        displayName: 'Consumo de Insumos',
        recordCount: db.stockConsumption.getAll().length,
        status: 'Conectado',
        description: 'Auditoria de baixa de produtos por atendimento realizado.'
      },
      {
        tableName: 'trial_registry',
        displayName: 'Registro de Avaliações',
        recordCount: db.trialRegistry.getAll().length,
        status: 'Conectado',
        description: 'Validação segura contra duplicidade de períodos de teste gratuito.'
      }
    ];
  },

  // Exportar backup completo do banco de dados
  exportDatabase(): string {
    const backup: Record<string, any> = {
      exportedAt: new Date().toISOString(),
      version: '1.0.0',
      database: 'Gendly MicroSaaS DB',
      tables: {}
    };

    Object.entries(DB_TABLES).forEach(([name, key]) => {
      backup.tables[name] = readTable(key, null);
    });

    return JSON.stringify(backup, null, 2);
  }
};
