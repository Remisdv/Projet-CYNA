import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Select } from '@/shared/components/ui/Select';
import { Filter, X } from 'lucide-react';
import type { RoleFilter, StatusFilter } from '../../lib/userLabels';

interface UsersFiltersProps {
  show: boolean;
  onToggleShow: () => void;
  hasActiveFilters: boolean;
  onClear: () => void;
  roleFilter: RoleFilter;
  onRoleChange: (v: RoleFilter) => void;
  statusFilter: StatusFilter;
  onStatusChange: (v: StatusFilter) => void;
  dateFrom: string;
  onDateFromChange: (v: string) => void;
  dateTo: string;
  onDateToChange: (v: string) => void;
}

export function UsersFilters({
  show, onToggleShow, hasActiveFilters, onClear,
  roleFilter, onRoleChange,
  statusFilter, onStatusChange,
  dateFrom, onDateFromChange,
  dateTo, onDateToChange,
}: UsersFiltersProps) {
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
            <Button variant="outline" size="sm" onClick={onToggleShow}>
              {show ? 'Masquer' : 'Afficher'}
            </Button>
          </div>
        </div>
      </CardHeader>
      {show && (
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select
              label="Rôle"
              value={roleFilter}
              onChange={(e) => onRoleChange(e.target.value as RoleFilter)}
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
                    onClick={() => onStatusChange(status)}
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
              onChange={(e) => onDateFromChange(e.target.value)}
            />

            <Input
              label="Date fin"
              type="date"
              value={dateTo}
              onChange={(e) => onDateToChange(e.target.value)}
            />
          </div>
        </CardContent>
      )}
    </Card>
  );
}
