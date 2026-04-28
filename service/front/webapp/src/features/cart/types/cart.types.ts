export interface ServerCartItem {
  id: string;
  productId: string;
  productName: string;
  productType: string;
  quantity: number;
  prix?: number;
  prixMensuel?: number;
  prixAnnuel?: number;
  periodicity?: string;
  image?: string;
}

export interface ServerCartResponse {
  items: ServerCartItem[];
}

export type AddToCartInput = Omit<ServerCartItem, 'id'>;
