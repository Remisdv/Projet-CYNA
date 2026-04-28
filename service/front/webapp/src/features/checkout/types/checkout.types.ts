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

export interface ConfirmPaymentResult {
  message: string;
}

import { z } from 'zod';

export const infoSchema = z.object({
  prenom: z.string().min(1, 'Prénom requis'),
  nom: z.string().min(1, 'Nom requis'),
  email: z.string().email('Email invalide'),
  telephone: z.string().optional(),
  adresse: z.string().min(1, 'Adresse requise'),
  ville: z.string().min(1, 'Ville requise'),
  codePostal: z.string().min(4, 'Code postal invalide'),
  pays: z.string().min(1, 'Pays requis'),
});

export type InfoForm = z.infer<typeof infoSchema>;

