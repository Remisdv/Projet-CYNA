export interface UserDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'COMMERCIAL';
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
}

export interface UsersResponse {
  items: UserDto[];
  total: number;
  page: number;
  limit: number;
}

export interface UsersListParams {
  page?: number;
  limit?: number;
  role?: string;
  status?: string;
  dateDebut?: string;
  dateFin?: string;
  sort?: string;
}

export type CreateUserInput = Omit<UserDto, 'id' | 'createdAt' | 'updatedAt'> & { password?: string };

export interface CreateUserResponse extends UserDto {
  tempPassword: string;
}
export type UpdateUserInput = Partial<UserDto> & { id: string };
