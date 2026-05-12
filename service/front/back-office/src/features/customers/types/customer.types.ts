export type CustomerStatus = 'ACTIVE' | 'INACTIVE';

export interface CustomerDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  status: CustomerStatus;
  twoFactorEnabled: boolean;
  totpEnabled: boolean;
  stripeCustomerId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CustomersResponse {
  items: CustomerDto[];
  total: number;
  page: number;
  limit: number;
}

export interface CustomersListParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  dateDebut?: string;
  dateFin?: string;
  sort?: string;
}

export interface CreateCustomerInput {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  status?: CustomerStatus;
}

export type UpdateCustomerInput = Partial<Omit<CustomerDto, 'id' | 'createdAt' | 'updatedAt' | 'twoFactorEnabled' | 'totpEnabled' | 'stripeCustomerId'>> & {
  id: string;
};

export interface CreateCustomerResponse extends CustomerDto {
  tempPassword: string;
}
