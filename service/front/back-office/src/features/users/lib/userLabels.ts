export function getRoleLabel(role: string) {
  switch (role?.toUpperCase()) {
    case 'ADMIN': return 'Admin';
    case 'COMMERCIAL': return 'Commercial';
    default: return role;
  }
}

export function getRoleBadgeVariant(role: string) {
  switch (role?.toUpperCase()) {
    case 'ADMIN': return 'destructive' as const;
    case 'COMMERCIAL': return 'default' as const;
    default: return 'secondary' as const;
  }
}

export type RoleFilter = 'all' | 'ADMIN' | 'COMMERCIAL';
export type StatusFilter = 'all' | 'ACTIVE' | 'INACTIVE';
export type SortField = 'email' | 'name' | 'role' | 'createdAt' | 'status';
export type SortDirection = 'asc' | 'desc';
