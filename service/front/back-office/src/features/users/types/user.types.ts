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
  data: UserDto[];
  total: number;
  page: number;
  limit: number;
}

export interface UsersListParams {
  page?: number;
  limit?: number;
  role?: string;
  status?: string;
}

export type CreateUserInput = Omit<UserDto, 'id' | 'createdAt' | 'updatedAt'> & { password?: string };
export type UpdateUserInput = Partial<UserDto> & { id: string };
