export interface Order {
  id: string;
  ref: string;
  clientEmail: string;
  clientName: string;
  amount: number;
  itemsCount: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'refunded' | 'failed';
  createdAt: string;
}

export interface OrderNote {
  id: string;
  text: string;
  date: string;
  by: string;
}

export interface OrderHistoryEntry {
  id: string;
  action: string;
  date: string;
  by: string;
}

export interface OrderItem {
  id: string;
  productName: string;
  productType?: 'produit' | 'service';
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface OrderCredential {
  serviceName: string;
  data: Record<string, string>;
  sentAt: string;
}

export interface OrderDetail {
  id: string;
  ref: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  clientEmail: string;
  clientFirstName: string;
  clientLastName: string;
  billingAddress: {
    street?: string;
    city?: string;
    postalCode?: string;
    country?: string;
  };
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  paymentRef: string;
  paymentAmount: number;
  paymentStatus: 'pending' | 'paid' | 'refunded' | 'failed';
  paymentDate?: string;
  trackingNumber?: string;
  credentials?: OrderCredential[];
  history: OrderHistoryEntry[];
  notes: OrderNote[];
}

export interface PaginatedOrders {
  items: Order[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}
