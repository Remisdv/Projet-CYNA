import { useEffect, useState } from 'react';
import {
  defaultFormData,
  type ServiceFormData,
  type TabId,
  type RawValuesState,
} from '../types/serviceForm.types';
import { loadDraft } from '../lib/serviceFormDraft';

const initialRaw: RawValuesState = {
  price: '0', monthlyPrice: '0', annualPrice: '0', stockQuantity: '0', lowStockThreshold: '10',
};

interface UseServiceFormInitArgs {
  service: any | null;
  isCreate: boolean;
}

export function useServiceFormInit({ service, isCreate }: UseServiceFormInitArgs) {
  const [initialized, setInitialized] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);
  const [formData, setFormData] = useState<ServiceFormData>({ ...defaultFormData });
  const [rawValues, setRawValues] = useState<RawValuesState>(initialRaw);
  const [activeTab, setActiveTab] = useState<TabId>('general');

  useEffect(() => {
    if (initialized) return;
    if (!isCreate && !service) return;

    if (service) {
      setFormData({
        name: service.name || '',
        shortDescription: service.shortDescription || '',
        longDescription: service.longDescription || '',
        category: service.category || '',
        type: service.type || 'product',
        tags: service.tags || [],
        price: Number(service.price) || 0,
        monthlyPrice: Number(service.monthlyPrice) || 0,
        annualPrice: Number(service.annualPrice) || 0,
        stockQuantity: service.stock === 'unlimited' ? 'unlimited' : (Number(service.stock) || 0),
        lowStockThreshold: Number(service.lowStockThreshold) || 10,
        images: (service.images || []).map((img: any, idx: number) => ({
          id: img.id || `existing-${idx}`,
          url: img.url || '',
          altText: img.altText || '',
          isPrimary: img.isPrimary || false,
          isNew: false,
        })),
        slug: service.slug || '',
        metaTitle: service.metaTitle || '',
        metaDescription: service.metaDescription || '',
        keywords: service.keywords || '',
        status: service.status || 'draft',
      });
      setRawValues({
        price: String(Number(service.price) || 0),
        monthlyPrice: String(Number(service.monthlyPrice) || 0),
        annualPrice: String(Number(service.annualPrice) || 0),
        stockQuantity: service.stock === 'unlimited' ? '0' : String(Number(service.stock) || 0),
        lowStockThreshold: String(Number(service.lowStockThreshold) || 10),
      });
    } else {
      const draft = loadDraft();
      if (draft) {
        setFormData(draft.data);
        setActiveTab(draft.tab);
        setHasDraft(true);
        setRawValues({
          price: String(draft.data.price ?? 0),
          monthlyPrice: String(draft.data.monthlyPrice ?? 0),
          annualPrice: String(draft.data.annualPrice ?? 0),
          stockQuantity: draft.data.stockQuantity === 'unlimited' ? '0' : String(draft.data.stockQuantity ?? 0),
          lowStockThreshold: String(draft.data.lowStockThreshold ?? 10),
        });
      } else {
        setFormData({ ...defaultFormData });
        setRawValues(initialRaw);
      }
    }
    setInitialized(true);
  }, [service, isCreate, initialized]);

  return {
    initialized, hasDraft, setHasDraft,
    formData, setFormData,
    rawValues, setRawValues,
    activeTab, setActiveTab,
  };
}

export function buildServicePayload(formData: ServiceFormData, publish: boolean): Record<string, any> {
  return {
    name: formData.name,
    shortDescription: formData.shortDescription,
    longDescription: formData.longDescription,
    category: formData.category,
    type: formData.type === 'product' ? 'produit' : 'service',
    tags: formData.tags,
    price: formData.type === 'product' ? formData.price : undefined,
    monthlyPrice: formData.type === 'service' ? formData.monthlyPrice : undefined,
    annualPrice: formData.type === 'service' ? formData.annualPrice : undefined,
    stock: formData.type === 'product' && formData.stockQuantity !== 'unlimited' ? formData.stockQuantity : undefined,
    // Always send explicit boolean so the gateway can clear `stock_illimite`
    // when switching a product from unlimited to finite stock.
    unlimitedStock: formData.type === 'service' || formData.stockQuantity === 'unlimited',
    lowStockThreshold: formData.lowStockThreshold,
    slug: formData.slug,
    metaTitle: formData.metaTitle,
    metaDescription: formData.metaDescription,
    keywords: formData.keywords,
    status: publish ? 'published' : formData.status,
  };
}
