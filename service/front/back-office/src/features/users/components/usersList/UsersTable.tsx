import { Button } from '@/shared/components/ui/Button';
import { Badge } from '@/shared/components/ui/Badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/shared/components/ui/Table';
import { Edit, Trash2, KeyRound, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import type { UserDto } from '../../hooks/useUsers';
import { getRoleLabel, getRoleBadgeVariant, type SortField, type SortDirection } from '../../lib/userLabels';

interface UsersTableProps {
  users: UserDto[];
  sortField: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
  onEdit: (u: UserDto) => void;
  onResetPassword: (u: UserDto) => void;
  onDelete: (u: UserDto) => void;
}

function SortIcon({ field, sortField, sortDirection }: { field: SortField; sortField: SortField; sortDirection: SortDirection }) {
  if (sortField !== field) {
    return <ArrowUpDown className="h-4 w-4 ml-1 text-gray-400" />;
  }
  return sortDirection === 'asc' ? (
    <ArrowUp className="h-4 w-4 ml-1 text-blue-600" />
  ) : (
    <ArrowDown className="h-4 w-4 ml-1 text-blue-600" />
  );
}

export function UsersTable({ users, sortField, sortDirection, onSort, onEdit, onResetPassword, onDelete }: UsersTableProps) {
  const headerCell = (field: SortField, label: string) => (
    <TableHead className="cursor-pointer hover:bg-gray-100" onClick={() => onSort(field)}>
      <div className="flex items-center">
        {label}
        <SortIcon field={field} sortField={sortField} sortDirection={sortDirection} />
      </div>
    </TableHead>
  );

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {headerCell('email', 'Email')}
          {headerCell('name', 'Nom')}
          {headerCell('role', 'Rôle')}
          {headerCell('createdAt', 'Date inscription')}
          {headerCell('status', 'Statut')}
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell className="font-medium">{user.email}</TableCell>
            <TableCell>{user.firstName} {user.lastName}</TableCell>
            <TableCell>
              <Badge variant={getRoleBadgeVariant(user.role)}>
                {getRoleLabel(user.role)}
              </Badge>
            </TableCell>
            <TableCell className="text-gray-500">
              {new Date(user.createdAt).toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
              })}
            </TableCell>
            <TableCell>
              <Badge variant={user.status?.toUpperCase() === 'ACTIVE' ? 'success' : 'secondary'}>
                {user.status?.toUpperCase() === 'ACTIVE' ? 'Actif' : 'Inactif'}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="flex items-center justify-end gap-1">
                <Button variant="ghost" size="sm" onClick={() => onEdit(user)} title="Éditer">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => onResetPassword(user)} title="Réinitialiser le mot de passe">
                  <KeyRound className="h-4 w-4 text-orange-600" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => onDelete(user)} title="Supprimer">
                  <Trash2 className="h-4 w-4 text-red-600" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
