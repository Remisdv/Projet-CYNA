import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { Plus, Users as UsersIcon } from 'lucide-react';
import UserFormModal from '../components/UserFormModal';
import { useUsers, useDeleteUser, useResetUserPassword, UserDto } from '../hooks/useUsers';
import type { RoleFilter, StatusFilter, SortField, SortDirection } from '../lib/userLabels';
import { UsersFilters } from '../components/usersList/UsersFilters';
import { UsersTable } from '../components/usersList/UsersTable';
import { UsersPagination } from '../components/usersList/UsersPagination';

const ITEMS_PER_PAGE = 25;

export default function UsersPage() {
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [currentPage, setCurrentPage] = useState(1);

  const sortBackendField = useMemo(() => {
    // Map UI sort field -> entity column name
    if (sortField === 'name') return 'lastName';
    return sortField;
  }, [sortField]);

  const { data: usersResponse, isLoading } = useUsers({
    page: currentPage,
    limit: ITEMS_PER_PAGE,
    role: roleFilter,
    status: statusFilter,
    dateDebut: dateFrom || undefined,
    dateFin: dateTo || undefined,
    sort: `${sortBackendField}:${sortDirection}`,
  });
  const users: UserDto[] = usersResponse?.items ?? [];
  const totalUsers = usersResponse?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalUsers / ITEMS_PER_PAGE));

  const deleteUser = useDeleteUser();
  const resetPassword = useResetUserPassword();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserDto | null>(null);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  const handleEdit = (user: UserDto) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleResetPassword = async (user: UserDto) => {
    if (!confirm(`Réinitialiser le mot de passe de ${user.email} ?`)) return;
    try {
      const { tempPassword } = await resetPassword.mutateAsync(user.id);
      // Surface the temp password to the admin since email sending isn't implemented yet.
      window.prompt(
        `Mot de passe temporaire pour ${user.email} (à transmettre à l'utilisateur) :`,
        tempPassword,
      );
    } catch (err: any) {
      alert(err?.response?.data?.message ?? 'Erreur lors de la réinitialisation');
    }
  };

  const handleDelete = async (user: UserDto) => {
    if (!confirm(`Supprimer l'utilisateur ${user.firstName} ${user.lastName} ?`)) return;
    try {
      await deleteUser.mutateAsync(user.id);
    } catch (err: any) {
      alert(err?.response?.data?.message ?? 'Erreur lors de la suppression');
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
            Gérez vos {totalUsers} utilisateurs
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
          {users.length === 0 ? (
            <div className="text-center py-12">
              <UsersIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Aucun utilisateur trouvé</p>
              {hasActiveFilters && (
                <Button className="mt-4" variant="outline" onClick={clearFilters}>
                  Effacer les filtres
                </Button>
              )}
            </div>
          ) : (
            <>
              <UsersTable
                users={users}
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
                itemsPerPage={ITEMS_PER_PAGE}
                totalItems={totalUsers}
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
