import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { Plus, Users as UsersIcon } from 'lucide-react';
import UserFormModal from '../components/UserFormModal';
import { useUsers, UserDto } from '../hooks/useUsers';
import type { RoleFilter, StatusFilter, SortField, SortDirection } from '../lib/userLabels';
import { UsersFilters } from '../components/usersList/UsersFilters';
import { UsersTable } from '../components/usersList/UsersTable';
import { UsersPagination } from '../components/usersList/UsersPagination';

export default function UsersPage() {
  const { data: usersResponse, isLoading } = useUsers();
  const users: UserDto[] = usersResponse?.data ?? [];
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserDto | null>(null);

  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;

  const filteredAndSortedUsers = useMemo(() => {
    let result = [...users];

    if (roleFilter !== 'all') {
      result = result.filter(u => u.role === roleFilter);
    }
    if (statusFilter !== 'all') {
      result = result.filter(u => u.status === statusFilter);
    }
    if (dateFrom) {
      const fromDate = new Date(dateFrom);
      result = result.filter(u => new Date(u.createdAt) >= fromDate);
    }
    if (dateTo) {
      const toDate = new Date(dateTo);
      toDate.setHours(23, 59, 59, 999);
      result = result.filter(u => new Date(u.createdAt) <= toDate);
    }

    result.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'email':
          comparison = a.email.localeCompare(b.email);
          break;
        case 'name':
          comparison = `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
          break;
        case 'role':
          comparison = a.role.localeCompare(b.role);
          break;
        case 'createdAt':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [users, roleFilter, statusFilter, dateFrom, dateTo, sortField, sortDirection]);

  const totalPages = Math.ceil(filteredAndSortedUsers.length / itemsPerPage);
  const paginatedUsers = filteredAndSortedUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleEdit = (user: UserDto) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleResetPassword = (user: UserDto) => {
    if (confirm(`Envoyer un email de rÃ©initialisation de mot de passe Ã  ${user.email} ?`)) {
      console.log('Sending password reset email to:', user.email);
      alert(`Email de rÃ©initialisation envoyÃ© Ã  ${user.email}`);
    }
  };

  const handleDelete = (user: UserDto) => {
    if (confirm(`ÃŠtes-vous sÃ»r de vouloir supprimer l'utilisateur ${user.firstName} ${user.lastName} ?`)) {
      console.log('Deleting user:', user.id);
      alert('Utilisateur supprimÃ© (mock)');
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  const clearFilters = () => {
    setRoleFilter('all');
    setStatusFilter('all');
    setDateFrom('');
    setDateTo('');
    setCurrentPage(1);
  };

  const hasActiveFilters = roleFilter !== 'all' || statusFilter !== 'all' || !!dateFrom || !!dateTo;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Utilisateurs</h1>
          <p className="text-gray-500 mt-1">
            GÃ©rez vos {filteredAndSortedUsers.length} utilisateurs
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nouvel Utilisateur
        </Button>
      </div>

      <UsersFilters
        show={showFilters}
        onToggleShow={() => setShowFilters(!showFilters)}
        hasActiveFilters={hasActiveFilters}
        onClear={clearFilters}
        roleFilter={roleFilter}
        onRoleChange={(v) => { setRoleFilter(v); setCurrentPage(1); }}
        statusFilter={statusFilter}
        onStatusChange={(v) => { setStatusFilter(v); setCurrentPage(1); }}
        dateFrom={dateFrom}
        onDateFromChange={(v) => { setDateFrom(v); setCurrentPage(1); }}
        dateTo={dateTo}
        onDateToChange={(v) => { setDateTo(v); setCurrentPage(1); }}
      />

      <Card>
        <CardContent className="p-0">
          {paginatedUsers.length === 0 ? (
            <div className="text-center py-12">
              <UsersIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Aucun utilisateur trouvÃ©</p>
              {hasActiveFilters && (
                <Button className="mt-4" variant="outline" onClick={clearFilters}>
                  Effacer les filtres
                </Button>
              )}
            </div>
          ) : (
            <>
              <UsersTable
                users={paginatedUsers}
                sortField={sortField}
                sortDirection={sortDirection}
                onSort={handleSort}
                onEdit={handleEdit}
                onResetPassword={handleResetPassword}
                onDelete={handleDelete}
              />

              <UsersPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                itemsPerPage={itemsPerPage}
                totalItems={filteredAndSortedUsers.length}
              />
            </>
          )}
        </CardContent>
      </Card>

      <UserFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        user={selectedUser}
      />
    </div>
  );
}
