import { useState } from 'react';
import { Card, CardContent } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { Plus, Users as UsersIcon, Pencil, Trash2, KeyRound, Search } from 'lucide-react';
import {
  useCustomers,
  useDeleteCustomer,
  useResetCustomerPassword,
} from '../hooks/useCustomers';
import type { CustomerDto } from '../types/customer.types';
import CustomerFormModal from '../components/CustomerFormModal';

const ITEMS_PER_PAGE = 25;

export default function CustomersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'ACTIVE' | 'INACTIVE'>('all');

  const { data, isLoading } = useCustomers({
    page,
    limit: ITEMS_PER_PAGE,
    search: search || undefined,
    status: statusFilter,
    sort: 'createdAt:desc',
  });

  const customers = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));

  const removeMut = useDeleteCustomer();
  const resetMut = useResetCustomerPassword();

  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState<CustomerDto | null>(null);

  const openCreate = () => {
    setSelected(null);
    setModalOpen(true);
  };
  const openEdit = (c: CustomerDto) => {
    setSelected(c);
    setModalOpen(true);
  };
  const closeModal = () => {
    setModalOpen(false);
    setSelected(null);
  };

  const handleDelete = async (c: CustomerDto) => {
    if (!confirm(`Supprimer le client ${c.email} ?`)) return;
    try {
      await removeMut.mutateAsync(c.id);
    } catch (err: any) {
      alert(err?.response?.data?.message ?? 'Erreur lors de la suppression');
    }
  };

  const handleReset = async (c: CustomerDto) => {
    if (!confirm(`Réinitialiser le mot de passe de ${c.email} ?`)) return;
    try {
      const { tempPassword } = await resetMut.mutateAsync(c.id);
      window.prompt(
        `Mot de passe temporaire pour ${c.email} (à transmettre au client) :`,
        tempPassword,
      );
    } catch (err: any) {
      alert(err?.response?.data?.message ?? 'Erreur lors de la réinitialisation');
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Clients</h1>
          <p className="text-gray-500 mt-1">
            Gérez vos {total} clients enregistrés sur la webapp
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Nouveau client
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-3 md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Rechercher (email, nom, prénom)"
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as 'all' | 'ACTIVE' | 'INACTIVE');
                setPage(1);
              }}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tous les statuts</option>
              <option value="ACTIVE">Actifs</option>
              <option value="INACTIVE">Inactifs</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          {customers.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <UsersIcon className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>Aucun client trouvé</p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Nom</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Téléphone</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Statut</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">2FA</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Inscrit le</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">{c.email}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {c.firstName} {c.lastName}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{c.phone || '—'}</td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={
                          c.status === 'ACTIVE'
                            ? 'px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700'
                            : 'px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700'
                        }
                      >
                        {c.status === 'ACTIVE' ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {c.twoFactorEnabled || c.totpEnabled ? 'Oui' : 'Non'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date(c.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-4 py-3 text-right space-x-1 whitespace-nowrap">
                      <button
                        onClick={() => openEdit(c)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                        title="Modifier"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleReset(c)}
                        className="p-1.5 text-amber-600 hover:bg-amber-50 rounded"
                        title="Réinitialiser le mot de passe"
                      >
                        <KeyRound className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(c)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                        title="Supprimer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">
            Page {page} sur {totalPages} ({total} clients)
          </span>
          <div className="space-x-2">
            <Button
              variant="secondary"
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Précédent
            </Button>
            <Button
              variant="secondary"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Suivant
            </Button>
          </div>
        </div>
      )}

      {modalOpen && (
        <CustomerFormModal isOpen={modalOpen} customer={selected} onClose={closeModal} />
      )}
    </div>
  );
}
