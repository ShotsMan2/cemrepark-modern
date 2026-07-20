import type { BuiltInProviderType } from "next-auth/providers/index";
import type { ClientSafeProvider, LiteralUnion } from "next-auth/react";

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
  categoryId?: number;
  category?: Category;
  createdAt: Date;
  updatedAt: Date;
  colors?: ProductColor[];
  variants?: ProductVariant[];
  reviews?: Review[];
}

export interface ProductColor {
  id: number;
  productId: number;
  renkAdi: string;
  gorselUrl: string;
}

export interface ProductVariant {
  id: number;
  productId: number;
  sku?: string;
  color?: string;
  size?: string;
  stock: number;
  price?: number;
}

export interface Category {
  id: number;
  name: string;
  slug?: string;
  parentId?: number;
  parent?: Category;
  children?: Category[];
  products?: Product[];
}

export interface Order {
  id: number;
  orderNumber?: string;
  customer: string;
  userId?: number;
  user?: User;
  total: number;
  couponCode?: string;
  discountAmount?: number;
  status: string;
  paymentStatus?: string;
  paymentMethod?: string;
  trackingNumber?: string;
  carrier?: string;
  shippingAddressId?: number;
  shippingAddress?: Address;
  billingAddressId?: number;
  billingAddress?: Address;
  createdAt: Date;
  updatedAt: Date;
  items?: OrderItem[];
  paymentTransactions?: PaymentTransaction[];
}

export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  product?: Product;
  variantId?: number;
  quantity: number;
  price: number;
}

export interface PaymentTransaction {
  id: number;
  orderId: number;
  provider: string;
  transactionId?: string;
  amount: number;
  currency: string;
  status: string;
  metadata?: string;
  createdAt: Date;
}

export interface User {
  id: number;
  name?: string;
  email: string;
  emailVerified?: string;
  image?: string;
  role: string;
  phoneNumber?: string;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  reviews?: Review[];
  orders?: Order[];
  addresses?: Address[];
  loginHistory?: LoginHistory[];
  auditLogs?: AuditLog[];
  notifications?: Notification[];
  cart?: Cart;
}

export interface Address {
  id: number;
  userId: number;
  title?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state?: string;
  postalCode?: string;
  country: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Banner {
  id: number;
  title: string;
  imageUrl: string;
  linkUrl?: string;
  isActive: boolean;
  order: number;
}

export interface Coupon {
  id: number;
  code: string;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: number;
  minCartValue?: number;
  maxUses?: number;
  usedCount: number;
  expiresAt?: string;
  isActive: boolean;
  createdAt: Date;
}

export interface CartItem {
  id: number;
  cartId: number;
  productId: number;
  product?: Product;
  quantity: number;
  variantId?: number;
  color?: string;
  size?: string;
}

export interface Cart {
  id: number;
  userId: number;
  items?: CartItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Review {
  id: number;
  productId: number;
  product?: Product;
  userId: number;
  user?: User;
  rating: number;
  comment: string;
  status: string;
  createdAt: Date;
}

export interface Message {
  id: number;
  adSoyad: string;
  telefon?: string;
  email: string;
  mesaj: string;
  tarih: string;
}

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
  [key: string]: unknown;
}

export interface Page {
  id: number;
  slug: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  versions?: PageVersion[];
}

export interface PageVersion {
  id: number;
  pageId: number;
  content: string;
  title?: string;
  version: number;
  createdBy?: string;
  createdAt: Date;
}

export interface LoginHistory {
  id: number;
  userId: number;
  ipAddress?: string;
  userAgent?: string;
  status: string;
  createdAt: Date;
}

export interface AuditLog {
  id: number;
  userId?: number;
  user?: User;
  action: string;
  entity: string;
  entityId: string;
  details?: string;
  createdAt: Date;
}

export interface Notification {
  id: number;
  userId: number;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
}

export interface Promotion {
  id: number;
  name: string;
  description?: string;
  type: string;
  conditionType?: string;
  conditionValue?: number;
  discountValue?: number;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface EmailTemplate {
  id: number;
  name: string;
  subject: string;
  body: string;
  variables?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ShippingMethod {
  id: number;
  name: string;
  provider: string;
  price: number;
  freeAbove?: number;
  isActive: boolean;
  estimatedDays?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CartContextProduct extends Product {
  cartItemId?: number;
  quantity: number;
  beden?: string;
  renk?: string;
  variantId?: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface RechartsDataPoint {
  name: string;
  value?: number;
  total?: number;
  orders?: number;
  [key: string]: string | number | undefined;
}

export interface RechartsPieData {
  name: string;
  value: number;
  fill?: string;
}

export interface RechartsCategoryData {
  name: string;
  value: number;
}

export interface AnalyticsDashboardData {
  revenue: number;
  orders: number;
  salesOverTime: RechartsDataPoint[];
  categoryData: RechartsCategoryData[];
  orderStats: RechartsPieData[];
  usersByRole: RechartsPieData[];
  loginStats: RechartsDataPoint[];
  [key: string]: unknown;
}

export interface ProductFormData {
  ad: string;
  fiyat: string;
  gorsel: string;
  etiket: string;
  kategori: string;
  renk: string;
  beden: string;
}

export type AdminTab =
  | "dashboard"
  | "products"
  | "orders"
  | "customers"
  | "messages"
  | "pages"
  | "banners"
  | "coupons"
  | "ai-support"
  | "security"
  | "settings";

export interface NotificationItem {
  id: string;
  text: string;
  time: string;
}

export interface BreadcrumbTitles {
  dashboard: string;
  products: string;
  orders: string;
  customers: string;
  messages: string;
  pages: string;
  banners: string;
  coupons: string;
  "ai-support": string;
  security: string;
  settings: string;
  [key: string]: string;
}

export type ProvidersType = Record<
  LiteralUnion<BuiltInProviderType, string>,
  ClientSafeProvider
> | null;
