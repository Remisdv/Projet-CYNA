// ========== TYPES ==========

export interface MockOrder {
  id: string;
  ref: string;
  clientEmail: string;
  clientName: string;
  amount: number;
  itemsCount: number;
  status: 'pending' | 'confirmed' | 'delivered' | 'cancelled';
  date: string;
  paymentStatus: 'pending' | 'paid' | 'refunded';
}

export interface OrderItem {
  id: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface MockOrderDetail {
  id: string;
  ref: string;
  status: 'pending' | 'confirmed' | 'delivered' | 'cancelled';
  date: string;
  clientEmail: string;
  clientFirstName: string;
  clientLastName: string;
  billingAddress: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  paymentRef: string;
  paymentAmount: number;
  paymentStatus: 'pending' | 'paid' | 'refunded';
  paymentDate?: string;
  history: Array<{ id: string; action: string; date: string; by: string }>;
  notes: Array<{ id: string; text: string; date: string; by: string }>;
}

// ========== MOCK DATA ==========

const generateMockOrders = (): MockOrder[] => {
  const statuses: MockOrder['status'][] = ['pending', 'confirmed', 'delivered', 'cancelled'];
  const firstNames = ['Jean', 'Marie', 'Pierre', 'Sophie', 'Luc', 'Anne', 'Paul', 'Claire'];
  const lastNames = ['Dupont', 'Martin', 'Bernard', 'Petit', 'Robert', 'Richard', 'Durand', 'Dubois'];

  return Array.from({ length: 87 }, (_, index) => {
    const firstName = firstNames[index % firstNames.length];
    const lastName = lastNames[Math.floor(index / 2) % lastNames.length];
    const daysAgo = Math.floor(Math.random() * 90);
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const paymentStatus: MockOrder['paymentStatus'] =
      status === 'cancelled' ? 'refunded' : status === 'pending' ? 'pending' : 'paid';

    return {
      id: `order-${(index + 1).toString().padStart(3, '0')}`,
      ref: `ORD-${Date.now() - index * 100000}-${(index + 1).toString().padStart(3, '0')}`,
      clientEmail: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${index > 40 ? index : ''}@email.com`,
      clientName: `${firstName} ${lastName}`,
      amount: Math.round((50 + Math.random() * 950) * 100) / 100,
      itemsCount: Math.floor(1 + Math.random() * 5),
      status,
      date: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString(),
      paymentStatus,
    };
  });
};

const mockOrders = generateMockOrders();

const generateMockOrderDetail = (orderId: string): MockOrderDetail => {
  const items: OrderItem[] = [
    { id: '1', productName: 'SOC Monitoring Pro', quantity: 2, unitPrice: 299.99, subtotal: 599.98 },
    { id: '2', productName: 'EDR Protection Advanced', quantity: 1, unitPrice: 499.99, subtotal: 499.99 },
    { id: '3', productName: 'Threat Intelligence Feed', quantity: 1, unitPrice: 149.99, subtotal: 149.99 },
  ];

  const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
  const tax = subtotal * 0.2;
  const total = subtotal + tax;

  return {
    id: orderId,
    ref: `ORD-${Date.now()}-${orderId}`,
    status: 'confirmed',
    date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    clientEmail: 'jean.dupont@email.com',
    clientFirstName: 'Jean',
    clientLastName: 'Dupont',
    billingAddress: {
      street: '123 Rue de la République',
      city: 'Paris',
      postalCode: '75001',
      country: 'France',
    },
    items,
    subtotal,
    tax,
    total,
    paymentRef: `pi_${Math.random().toString(36).substring(7)}`,
    paymentAmount: total,
    paymentStatus: 'paid',
    paymentDate: new Date(Date.now() - Math.random() * 25 * 24 * 60 * 60 * 1000).toISOString(),
    history: [
      { id: '1', action: 'Commande créée', date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), by: 'Système' },
      { id: '2', action: 'Paiement confirmé', date: new Date(Date.now() - 29 * 24 * 60 * 60 * 1000).toISOString(), by: 'Stripe' },
      { id: '3', action: 'Commande confirmée', date: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(), by: 'Admin' },
    ],
    notes: [
      { id: '1', text: 'Client a demandé une livraison urgente', date: new Date(Date.now() - 27 * 24 * 60 * 60 * 1000).toISOString(), by: 'Jean Martin (Commercial)' },
    ],
  };
};

// ========== HOOKS ==========

export const useOrders = () => ({
  data: mockOrders,
  isLoading: false as const,
  isError: false as const,
});

export const useOrderDetail = (orderId: string) => ({
  data: generateMockOrderDetail(orderId),
  isLoading: false as const,
  isError: false as const,
});
