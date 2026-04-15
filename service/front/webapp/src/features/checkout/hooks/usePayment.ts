import { useMutation } from '@tanstack/react-query';
import api from '../../../services/api';

export interface PaymentItem {
  productId: string;
  productName: string;
  productType: 'produit' | 'service';
  quantity: number;
  unitPrice: number;
  periodicity?: 'mensuel' | 'annuel';
}

export interface PaymentAddress {
  street: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface CreatePaymentIntentData {
  items: PaymentItem[];
  billingAddress: PaymentAddress;
  shippingAddress?: PaymentAddress;
}

export interface PaymentIntentResult {
  clientSecret?: string;
  subscriptionClientSecret?: string;
  orderId?: number;
  orderRef?: string;
  subscriptionId?: number;
  message: string;
}

export function useCreatePaymentIntent() {
  return useMutation({
    mutationFn: async (data: CreatePaymentIntentData) => {
      const { data: result } = await api.post('/webapp/payment/create-intent', data);
      return result as PaymentIntentResult;
    },
  });
}
