import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { Plus, Package } from 'lucide-react';
import { useServices, useServiceCategories, useDeleteService, useDuplicateService } from '../hooks/useServices';
import type { Service } from '../types/service.types';
import type { SortField, SortDirection, StatusFilter } from '../types/servicesList.types';
import { ServicesFilters } from '../components/servicesList/ServicesFilters';
import { ServicesTable } from '../components/servicesList/ServicesTable';
import { ServicesPagination } from '../components/servicesList/ServicesPagination';

export default function ServicesPage() {
  const navigate = useNavigate();
  const { data: services = [], isLoading: servicesLoading } = useServices();
  const { data: categories } = useServiceCategories();
  const deleteService = useDeleteService();
  const duplicateService = useDuplicateService();

  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const [sortField, setSortField] = useState<SortField>('lastModified');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const categoryLabelById = useMemo(() => {
    const map = new Map<string, string>();
    (categories ?? []).forEach(c => { if (c.value) map.set(c.value, c.label); });
    return map;
  }, [categories]);
  const getCategoryLabel = (id: string) => categoryLabelById.get(id) ?? id;

  const filteredAndSortedServices = useMemo(() => {
    let result = [...services];

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

    result.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'category':
          comparison = getCategoryLabel(a.category).localeCompare(getCategoryLabel(b.category));
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
  }, [services, categoryFilter, statusFilter, priceMin, priceMax, sortField, sortDirection, categoryLabelById]);

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

  const handleEdit = (service: Service) => {
    navigate(`/catalog/services/${service.id}/edit`);
  };

  const handleDuplicate = (service: Service) => {
    duplicateService.mutate(service.id);
  };

  const handleArchive = (service: Service) => {
    if (confirm(`ÃŠtes-vous sÃ»r de vouloir archiver "${service.name}" ?`)) {
      deleteService.mutate(service.id);
    }
  };

  const clearFilters = () => {
    setCategoryFilter('');
    setStatusFilter('all');
    setPriceMin('');
    setPriceMax('');
    setCurrentPage(1);
  };

  const hasActiveFilters = !!(categoryFilter || statusFilter !== 'all' || priceMin || priceMax);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Services</h1>
          <p className="text-gray-500 mt-1">
            {servicesLoading ? 'Chargement...' : `GÃ©rez vos ${filteredAndSortedServices.length} services et produits`}
          </p>
        </div>
        <Button onClick={() => navigate('/catalog/services/new')}>
          <Plus className="h-4 w-4 mr-2" />
          Nouveau Service
        </Button>
      </div>

      <ServicesFilters
        show={showFilters}
        onToggleShow={() => setShowFilters(!showFilters)}
        hasActiveFilters={hasActiveFilters}
        onClear={clearFilters}
        categories={categories}
        categoryFilter={categoryFilter}
        onCategoryChange={(v) => { setCategoryFilter(v); setCurrentPage(1); }}
        statusFilter={statusFilter}
        onStatusChange={(v) => { setStatusFilter(v); setCurrentPage(1); }}
        priceMin={priceMin}
        onPriceMinChange={(v) => { setPriceMin(v); setCurrentPage(1); }}
        priceMax={priceMax}
        onPriceMaxChange={(v) => { setPriceMax(v); setCurrentPage(1); }}
      />

      <Card>
        <CardContent className="p-0">
          {paginatedServices.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Aucun service trouvÃ©</p>
              {hasActiveFilters && (
                <Button className="mt-4" variant="outline" onClick={clearFilters}>
                  Effacer les filtres
                </Button>
              )}
            </div>
          ) : (
            <>
              <ServicesTable
                services={paginatedServices}
                sortField={sortField}
                sortDirection={sortDirection}
                onSort={handleSort}
                getCategoryLabel={getCategoryLabel}
                onEdit={handleEdit}
                onDuplicate={handleDuplicate}
                onArchive={handleArchive}
              />

              <ServicesPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                itemsPerPage={itemsPerPage}
                totalItems={filteredAndSortedServices.length}
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
