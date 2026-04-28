import { apiClient } from '@/shared/lib/apiClient';
import type { CreatePaymentIntentData, PaymentIntentResult, ConfirmPaymentResult } from '../types/checkout.types';

export const checkoutApi = {
  createPaymentIntent: async (input: CreatePaymentIntentData): Promise<PaymentIntentResult> => {
    const { data } = await apiClient.post<PaymentIntentResult>('/webapp/payment/create-intent', input);
    return data;
  },
  confirmPayment: async (orderId: string): Promise<ConfirmPaymentResult> => {
    const { data } = await apiClient.post<ConfirmPaymentResult>('/webapp/payment/confirm', { orderId });
    return data;
  },
};
