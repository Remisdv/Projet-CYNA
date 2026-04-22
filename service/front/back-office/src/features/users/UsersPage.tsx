import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/Table';
import {
  Plus,
  Edit,
  Trash2,
  Users as UsersIcon,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Filter,
  X,
  KeyRound,
} from 'lucide-react';
import UserFormModal from './UserFormModal';
import { useUsers, UserDto } from './hooks/useUsers';

type SortField = 'email' | 'name' | 'role' | 'createdAt' | 'status';
type SortDirection = 'asc' | 'desc';

export default function UsersPage() {
  const { data: usersResponse, isLoading } = useUsers();
  const users: UserDto[] = usersResponse?.data ?? [];
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserDto | null>(null);

  // Filters
  const [roleFilter, setRoleFilter] = useState<'all' | 'ADMIN' | 'COMMERCIAL'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'ACTIVE' | 'INACTIVE'>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Sorting
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;

  // Filter and sort users
  const filteredAndSortedUsers = useMemo(() => {
    let result = [...users];

    // Apply filters
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

    // Apply sorting
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

  // Pagination
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

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4 ml-1 text-gray-400" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="h-4 w-4 ml-1 text-blue-600" />
    ) : (
      <ArrowDown className="h-4 w-4 ml-1 text-blue-600" />
    );
  };

  const handleEdit = (user: UserDto) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleResetPassword = (user: UserDto) => {
    if (confirm(`Envoyer un email de réinitialisation de mot de passe à ${user.email} ?`)) {
      console.log('Sending password reset email to:', user.email);
      alert(`Email de réinitialisation envoyé à ${user.email}`);
    }
  };

  const handleDelete = (user: UserDto) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur ${user.firstName} ${user.lastName} ?`)) {
      console.log('Deleting user:', user.id);
      alert('Utilisateur supprimé (mock)');
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

  const getRoleLabel = (role: string) => {
    switch (role?.toUpperCase()) {
      case 'ADMIN': return 'Admin';
      case 'COMMERCIAL': return 'Commercial';
      default: return role;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role?.toUpperCase()) {
      case 'ADMIN': return 'destructive';
      case 'COMMERCIAL': return 'default';
      default: return 'secondary';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Utilisateurs</h1>
          <p className="text-gray-500 mt-1">
            Gérez vos {filteredAndSortedUsers.length} utilisateurs
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nouvel Utilisateur
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtres
            </CardTitle>
            <div className="flex items-center gap-2">
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="h-4 w-4 mr-1" />
                  Effacer
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                {showFilters ? 'Masquer' : 'Afficher'}
              </Button>
            </div>
          </div>
        </CardHeader>
        {showFilters && (
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Select
                label="Rôle"
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value as any);
                  setCurrentPage(1);
                }}
                options={[
                  { value: 'all', label: 'Tous les rôles' },
                  { value: 'ADMIN', label: 'Admin' },
                  { value: 'COMMERCIAL', label: 'Commercial' },
                ]}
              />

              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Statut
                </label>
                <div className="flex gap-2">
                  {(['all', 'ACTIVE', 'INACTIVE'] as const).map((status) => (
                    <button
                      key={status}
                      onClick={() => {
                        setStatusFilter(status);
                        setCurrentPage(1);
                      }}
                      className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        statusFilter === status
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {status === 'all' ? 'Tous' : status === 'ACTIVE' ? 'Actif' : 'Inactif'}
                    </button>
                  ))}
                </div>
              </div>

              <Input
                label="Date début"
                type="date"
                value={dateFrom}
                onChange={(e) => {
                  setDateFrom(e.target.value);
                  setCurrentPage(1);
                }}
              />

              <Input
                label="Date fin"
                type="date"
                value={dateTo}
                onChange={(e) => {
                  setDateTo(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </CardContent>
        )}
      </Card>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          {paginatedUsers.length === 0 ? (
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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead
                      className="cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('email')}
                    >
                      <div className="flex items-center">
                        Email
                        {getSortIcon('email')}
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('name')}
                    >
                      <div className="flex items-center">
                        Nom
                        {getSortIcon('name')}
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('role')}
                    >
                      <div className="flex items-center">
                        Rôle
                        {getSortIcon('role')}
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('createdAt')}
                    >
                      <div className="flex items-center">
                        Date inscription
                        {getSortIcon('createdAt')}
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('status')}
                    >
                      <div className="flex items-center">
                        Statut
                        {getSortIcon('status')}
                      </div>
                    </TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.email}</TableCell>
                      <TableCell>
                        {user.firstName} {user.lastName}
                      </TableCell>
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
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(user)}
                            title="Éditer"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleResetPassword(user)}
                            title="Réinitialiser le mot de passe"
                          >
                            <KeyRound className="h-4 w-4 text-orange-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(user)}
                            title="Supprimer"
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className="flex items-center justify-between px-6 py-4 border-t">
                <div className="text-sm text-gray-500">
                  Affichage {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredAndSortedUsers.length)} sur {filteredAndSortedUsers.length} résultats
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Précédent
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                            currentPage === pageNum
                              ? 'bg-blue-600 text-white'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Suivant
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* User Form Modal */}
      <UserFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        user={selectedUser}
      />
    </div>
  );
}
