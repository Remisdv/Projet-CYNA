export interface ServiceImage {
  id?: string;
  url: string;
  altText: string;
  isPrimary: boolean;
}

export interface Service {
  id: string;
  name: string;
  category: string;
  price: number;
  monthlyPrice?: number;
  annualPrice?: number;
  annualDiscountPct?: number;
  stock: number | 'unlimited';
  lowStockThreshold: number;
  status: 'draft' | 'published';
  type: 'product' | 'service';
  shortDescription: string;
  longDescription?: string;
  tags: string[];
  slug: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  images: ServiceImage[];
  updatedAt: string;
  createdAt: string;
  autoRenewal?: boolean;
  demoAvailable?: boolean;
  periodicity?: string;
}

export interface ServiceCategory {
  value: string;
  label: string;
}

export interface UploadedImage {
  id: string;
  url: string;
  filename: string;
  mimetype: string;
  size: number;
}
