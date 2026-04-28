import { useMutation } from '@tanstack/react-query';
import { checkoutApi } from '../api/checkout.api';
import type { CreatePaymentIntentData } from '../types/checkout.types';

export type {
  PaymentItem,
  PaymentAddress,
  CreatePaymentIntentData,
  PaymentIntentResult,
} from '../types/checkout.types';

export function useCreatePaymentIntent() {
  return useMutation({
    mutationFn: (data: CreatePaymentIntentData) => checkoutApi.createPaymentIntent(data),
  });
}

export function useConfirmPayment() {
  return useMutation({
    mutationFn: (orderId: string) => checkoutApi.confirmPayment(orderId),
  });
}

