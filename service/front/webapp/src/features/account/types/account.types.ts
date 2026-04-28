export interface Address {
  street: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface Profile {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  billingAddress?: Address;
  shippingAddress?: Address;
  status: string;
  createdAt: string;
}

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  billingAddress?: Address;
  shippingAddress?: Address;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  productType?: 'produit' | 'service';
  type: 'produit' | 'service';
  quantity: number;
  unitPrice: number;
  periodicity?: string;
}

export interface OrderCredential {
  serviceName: string;
  data: Record<string, string>;
  sentAt: string;
}

export interface Order {
  id: number;
  ref: string;
  items: OrderItem[];
  amount: number;
  status: string;
  paymentStatus: string;
  billingAddress: Record<string, string>;
  shippingAddress?: Record<string, string>;
  trackingNumber?: string;
  credentials?: OrderCredential[];
  createdAt: string;
}

export interface OrdersListResponse {
  data: Order[];
  total: number;
  page: number;
  limit: number;
}

export interface TrackingData {
  trackingNumber: string | null;
  credentials: OrderCredential[];
  status: string;
  shippedAt: string | null;
  history: Array<{ action: string; date: string; by: string }>;
}

export interface Subscription {
  id: number;
  productId: string;
  productName: string;
  planType: 'mensuel' | 'annuel';
  status: 'active' | 'cancelled' | 'expired';
  price: number;
  startDate: string;
  renewalDate?: string;
  createdAt: string;
}
