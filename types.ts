
import React from 'react';

export interface Category {
  id: string;
  name: string;
  unit: 'Litros' | 'ML' | 'Kg' | 'Unidade';
  quantity: number;
  peopleCount: number;
  companyId: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  minQuantity?: number; 
  categoryId?: string; 
  image: string | null; 
  sku: string;
  companyId: string; 
  type: 'SERVICE' | 'PRODUCT';
  purpose?: 'SALE' | 'STOCK'; 
  
  subtype?: 'SINGLE' | 'PACKAGE'; 
  packageItems?: string[]; 
  sessionCount?: number; 
}

export interface Client {
  id: string;
  name: string;
  nickname: string;
  whatsapp: string;
  birthday: string;
  avatar: string | null;
  companyId: string;
}

export interface Specialty {
  id: string;
  name: string;
  companyId: string;
}

export interface Professional {
  id: string;
  companyId: string;
  name: string;
  nickname: string;
  whatsapp: string;
  specialtyId: string;
  avatar: string | null;
}

export type PlanType = 'ESSENTIAL' | 'PROFESSIONAL' | 'PREMIUM';

export interface Company {
  id: string;
  name: string;
  subName?: string;
  logo: string;
  taxId: string; 
  businessType: 'PF' | 'PJ';
  plan: PlanType;
  trialStartDate?: string; 
  neverExpires?: boolean;
}

export interface UserPermissions {
  financial: boolean;
  settings: boolean;
  stock: boolean;
  store: boolean;
  promotions: boolean;
  loyalty: boolean;
}

export interface User {
  id: string;
  username: string;
  password: string; 
  name: string;
  companyId: string;
  role: 'ADMIN' | 'USER';
  isMaster?: boolean;
  neverExpires?: boolean;
  permissions: UserPermissions;
}

export enum ViewState {
  DASHBOARD = 'DASHBOARD',
  PRODUCTS = 'PRODUCTS', 
  CLIENTS = 'CLIENTS',
  PROFESSIONALS = 'PROFESSIONALS',
  SETTINGS = 'SETTINGS',
  STORE = 'STORE', 
  FINANCIAL = 'FINANCIAL',
  CALENDAR = 'CALENDAR',
  LOYALTY = 'LOYALTY',
  PROMOTIONS = 'PROMOTIONS',
  STOCK = 'STOCK'
}

export interface StatCardProps {
  title: string;
  value: string;
  trend: string;
  trendUp: boolean;
  icon: React.ReactNode;
}

export type PaymentMethod = 'PIX' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'CASH' | 'OTHER';

export interface PaymentDetails {
  type: 'CASH' | 'INSTALLMENTS';
  date: string;
  method?: PaymentMethod; 
  installments?: number;
  installmentValue?: number;
}

export interface Installment {
  number: number;
  value: number;
  dueDate: string;
  status: 'PAID' | 'PENDING' | 'OVERDUE';
  paidAt?: string; 
}

export interface Sale {
  id: string;
  clientId: string;
  companyId: string;
  date: string;
  total: number;
  items: { productId: string; quantity: number; priceAtSale: number }[];
  installments: Installment[];
  paymentType: 'CASH' | 'INSTALLMENTS';
  packageId?: number; 
}

export interface Appointment {
  id: number;
  companyId: string; 
  time: string;
  rawDate: string; 
  date: string; 
  weekday: string;
  client: string; 
  clientNickname?: string; 
  avatar: string;
  professional: string;
  professionalAvatar: string;
  service: string;
  category: string;
  status: string;
  canRemind: boolean;
  isReward?: boolean;
  discountApplied?: number; 
}

export interface QueueItem {
  id: string;
  companyId: string; 
  clientId: string;
  clientName: string;
  clientAvatar: string | null;
  serviceId: string;
  serviceName: string;
  category: 'SINGLE' | 'PACKAGE';
  addedAt: number; 
}

export interface LoyaltyRedemption {
  id: string;
  companyId: string; 
  clientId: string;
  clientName: string;
  clientAvatar: string | null;
  productId: string;
  productName: string;
  originalPrice: number;
  discountPercent: number; 
  finalPrice: number;
  expiryDate: string;
  notifiedAt: number;
}

export interface Promotion {
  id: string;
  companyId: string;
  itemId: string; 
  itemType: 'SERVICE' | 'PACKAGE' | 'PRODUCT';
  promoPrice: number;
  expiryDate: string;
  targetClientIds: string[]; 
  active: boolean;
}
