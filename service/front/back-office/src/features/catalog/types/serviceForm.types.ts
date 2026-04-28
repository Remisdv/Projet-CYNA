import type React from 'react';

export interface ServiceImage {
  id: string;
  url: string;
  altText: string;
  isPrimary: boolean;
  isNew?: boolean;
}

export interface ServiceFormData {
  name: string;
  shortDescription: string;
  longDescription: string;
  category: string;
  type: 'product' | 'service';
  tags: string[];
  price: number;
  monthlyPrice: number;
  annualPrice: number;
  stockQuantity: number | 'unlimited';
  lowStockThreshold: number;
  images: ServiceImage[];
  slug: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  status: 'draft' | 'published';
}

export type TabId = 'general' | 'pricing' | 'stock' | 'images' | 'seo';

export interface TabDescriptor {
  id: TabId;
  label: string;
  icon: React.ReactNode;
}

export type RawValuesState = {
  price: string;
  monthlyPrice: string;
  annualPrice: string;
  stockQuantity: string;
  lowStockThreshold: string;
};

export const defaultFormData: ServiceFormData = {
  name: '',
  shortDescription: '',
  longDescription: '',
  category: '',
  type: 'product',
  tags: [],
  price: 0,
  monthlyPrice: 0,
  annualPrice: 0,
  stockQuantity: 0,
  lowStockThreshold: 10,
  images: [],
  slug: '',
  metaTitle: '',
  metaDescription: '',
  keywords: '',
  status: 'draft',
};

export const availableTags = [
  'cybersecurity', 'protection', 'monitoring', 'detection', 'response',
  'cloud', 'enterprise', 'sme', 'managed', 'consulting',
];
