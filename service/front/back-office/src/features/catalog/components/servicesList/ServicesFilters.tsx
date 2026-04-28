import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Select } from '@/shared/components/ui/Select';
import { Filter, X } from 'lucide-react';
import type { StatusFilter } from '../../types/servicesList.types';

interface CategoryOption { value: string; label: string }

interface ServicesFiltersProps {
  show: boolean;
  onToggleShow: () => void;
  hasActiveFilters: boolean;
  onClear: () => void;
  categories: CategoryOption[] | undefined;
  categoryFilter: string;
  onCategoryChange: (v: string) => void;
  statusFilter: StatusFilter;
  onStatusChange: (v: StatusFilter) => void;
  priceMin: string;
  onPriceMinChange: (v: string) => void;
  priceMax: string;
  onPriceMaxChange: (v: string) => void;
}

export function ServicesFilters({
  show, onToggleShow, hasActiveFilters, onClear,
  categories, categoryFilter, onCategoryChange,
  statusFilter, onStatusChange,
  priceMin, onPriceMinChange,
  priceMax, onPriceMaxChange,
}: ServicesFiltersProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtres
          </CardTitle>
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={onClear}>
                <X className="h-4 w-4 mr-1" />
                Effacer
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={onToggleShow}
            >
              {show ? 'Masquer' : 'Afficher'}
            </Button>
          </div>
        </div>
      </CardHeader>
      {show && (
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select
              label="Catégorie"
              value={categoryFilter}
              onChange={(e) => onCategoryChange(e.target.value)}
              options={categories ?? []}
            />

            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Statut
              </label>
              <div className="flex gap-2">
                {(['all', 'draft', 'published'] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => onStatusChange(status)}
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
              onChange={(e) => onPriceMinChange(e.target.value)}
              placeholder="0"
            />

            <Input
              label="Prix max (€)"
              type="number"
              value={priceMax}
              onChange={(e) => onPriceMaxChange(e.target.value)}
              placeholder="1000"
            />
          </div>
        </CardContent>
      )}
    </Card>
  );
}
