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
  Copy,
  Archive,
  Package,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Filter,
  X,
} from 'lucide-react';
import ServiceFormModal from './ServiceFormModal';
import { useServices, useServiceCategories, useDeleteService, useDuplicateService, Service } from './hooks/useServices';

type SortField = 'name' | 'category' | 'price' | 'stock' | 'status' | 'lastModified';
type SortDirection = 'asc' | 'desc';

export default function ServicesPage() {
  const { data: services = [], isLoading: servicesLoading } = useServices();
  const { data: categories } = useServiceCategories();
  const deleteService = useDeleteService();
  const duplicateService = useDuplicateService();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  // Filters
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'published'>('all');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Sorting
  const [sortField, setSortField] = useState<SortField>('lastModified');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Filter and sort services
  const filteredAndSortedServices = useMemo(() => {
    let result = [...services];

    // Apply filters
    if (categoryFilter) {
      result = result.filter(s => s.category === categoryFilter);
    }
    if (statusFilter !== 'all') {
      result = result.filter(s => s.status === statusFilter);
    }
    if (priceMin) {
      result = result.filter(s => s.price >= parseFloat(priceMin));
    }
    if (priceMax) {
      result = result.filter(s => s.price <= parseFloat(priceMax));
    }

    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'category':
          comparison = a.category.localeCompare(b.category);
          break;
        case 'price':
          comparison = a.price - b.price;
          break;
        case 'stock': {
          const stockA = a.stock === 'unlimited' ? Infinity : a.stock;
          const stockB = b.stock === 'unlimited' ? Infinity : b.stock;
          comparison = stockA - stockB;
          break;
        }
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
        case 'lastModified':
          comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
          break;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [services, categoryFilter, statusFilter, priceMin, priceMax, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedServices.length / itemsPerPage);
  const paginatedServices = filteredAndSortedServices.slice(
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

  const handleEdit = (service: Service) => {
    setSelectedService(service);
    setIsModalOpen(true);
  };

  const handleDuplicate = (service: Service) => {
    duplicateService.mutate(service.id);
  };

  const handleArchive = (service: Service) => {
    if (confirm(`Êtes-vous sûr de vouloir archiver "${service.name}" ?`)) {
      deleteService.mutate(service.id);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedService(null);
  };

  const clearFilters = () => {
    setCategoryFilter('');
    setStatusFilter('all');
    setPriceMin('');
    setPriceMax('');
    setCurrentPage(1);
  };

  const hasActiveFilters = categoryFilter || statusFilter !== 'all' || priceMin || priceMax;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Services</h1>
          <p className="text-gray-500 mt-1">
            {servicesLoading ? 'Chargement...' : `Gérez vos ${filteredAndSortedServices.length} services et produits`}
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nouveau Service
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
                label="Catégorie"
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setCurrentPage(1);
                }}
                options={categories}
              />

              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Statut
                </label>
                <div className="flex gap-2">
                  {(['all', 'draft', 'published'] as const).map((status) => (
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
                      {status === 'all' ? 'Tous' : status === 'draft' ? 'Brouillon' : 'Publié'}
                    </button>
                  ))}
                </div>
              </div>

              <Input
                label="Prix min (€)"
                type="number"
                value={priceMin}
                onChange={(e) => {
                  setPriceMin(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="0"
              />

              <Input
                label="Prix max (€)"
                type="number"
                value={priceMax}
                onChange={(e) => {
                  setPriceMax(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="1000"
              />
            </div>
          </CardContent>
        )}
      </Card>

      {/* Services Table */}
      <Card>
        <CardContent className="p-0">
          {paginatedServices.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Aucun service trouvé</p>
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
                      onClick={() => handleSort('name')}
                    >
                      <div className="flex items-center">
                        Nom
                        {getSortIcon('name')}
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('category')}
                    >
                      <div className="flex items-center">
                        Catégorie
                        {getSortIcon('category')}
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('price')}
                    >
                      <div className="flex items-center">
                        Prix
                        {getSortIcon('price')}
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('stock')}
                    >
                      <div className="flex items-center">
                        Stock
                        {getSortIcon('stock')}
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
                    <TableHead
                      className="cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('lastModified')}
                    >
                      <div className="flex items-center">
                        Dernière modif
                        {getSortIcon('lastModified')}
                      </div>
                    </TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedServices.map((service) => (
                    <TableRow key={service.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-gray-900">{service.name}</p>
                          <p className="text-xs text-gray-500">{service.type === 'service' ? 'Service' : 'Produit'}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{service.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{service.price.toFixed(2)} €</p>
                          {service.type === 'service' && (
                            <p className="text-xs text-gray-500">/mois</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {service.stock === 'unlimited' ? (
                          <Badge variant="default">Illimité</Badge>
                        ) : (
                          <span
                            className={
                              service.stock < service.lowStockThreshold
                                ? 'text-orange-600 font-medium'
                                : 'text-green-600'
                            }
                          >
                            {service.stock}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={service.status === 'published' ? 'success' : 'warning'}>
                          {service.status === 'published' ? 'Publié' : 'Brouillon'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-500 text-sm">
                        {service.updatedAt ? new Date(service.updatedAt).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                        }) : '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(service)}
                            title="Éditer"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDuplicate(service)}
                            title="Dupliquer"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleArchive(service)}
                            title="Archiver"
                          >
                            <Archive className="h-4 w-4 text-orange-600" />
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
                  Affichage {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredAndSortedServices.length)} sur {filteredAndSortedServices.length} résultats
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

      {/* Service Form Modal */}
      <ServiceFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        service={selectedService}
      />
    </div>
  );
}
