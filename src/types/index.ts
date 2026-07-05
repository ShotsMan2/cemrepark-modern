// Product Types
export interface Product {
  id: number;
  ad: string;
  fiyat: number;
  kategori?: string;
  resim?: string;
  gorsel?: string;
  etiket?: string;
  renk?: string;
  beden?: string;
  stok: number;
}

// Banner Types
export interface Banner {
  id: number;
  title: string;
  imageUrl: string;
  linkUrl?: string;
  isActive: boolean;
  order: number;
}

// User Types
export interface User {
  id: number;
  email: string;
  role: string;
}

// Message Types
export interface Message {
  id: number;
  adSoyad: string;
  telefon?: string;
  email: string;
  mesaj: string;
  tarih: string;
}

// Page Types
export interface Page {
  id: number;
  slug: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

// Settings Types
export interface Settings {
  siteAdi: string;
  iletisimEposta: string;
  destekTelefonu: string;
  adres: string;
  kargoUcreti: number;
  ucretsizKargoLimiti: number;
  ayniGunTeslimat: boolean;
  bakimModu: boolean;
  ozelCss: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Cart Types
export interface CartItem {
  id: number;
  productId: number;
  quantity: number;
}

// Order Types
export interface Order {
  id: number;
  customer: string;
  userId?: number;
  total: number;
  status: string;
  createdAt: Date;
}
