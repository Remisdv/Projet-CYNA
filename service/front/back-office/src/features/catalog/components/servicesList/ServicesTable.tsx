import { Button } from '@/shared/components/ui/Button';
import { Badge } from '@/shared/components/ui/Badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/shared/components/ui/Table';
import { Edit, Copy, Archive, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import type { SortField, SortDirection } from '../../types/servicesList.types';
import type { Service } from '../../types/service.types';

interface ServicesTableProps {
  services: Service[];
  sortField: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
  getCategoryLabel: (id: string) => string;
  onEdit: (s: Service) => void;
  onDuplicate: (s: Service) => void;
  onArchive: (s: Service) => void;
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

export function ServicesTable({
  services, sortField, sortDirection, onSort, getCategoryLabel,
  onEdit, onDuplicate, onArchive,
}: ServicesTableProps) {
  const headerCell = (field: SortField, label: string) => (
    <TableHead
      className="cursor-pointer hover:bg-gray-100"
      onClick={() => onSort(field)}
    >
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
          {headerCell('name', 'Nom')}
          {headerCell('category', 'Catégorie')}
          {headerCell('price', 'Prix')}
          {headerCell('stock', 'Stock')}
          {headerCell('status', 'Statut')}
          {headerCell('lastModified', 'Dernière modif')}
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {services.map((service) => (
          <TableRow key={service.id}>
            <TableCell>
              <div>
                <p className="font-medium text-gray-900">{service.name}</p>
                <p className="text-xs text-gray-500">{service.type === 'service' ? 'Service' : 'Produit'}</p>
              </div>
            </TableCell>
            <TableCell>
              <Badge variant="secondary">{getCategoryLabel(service.category)}</Badge>
            </TableCell>
            <TableCell>
              <div>
                <p className="font-medium">{Number(service.price).toFixed(2)} €</p>
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
                <Button variant="ghost" size="sm" onClick={() => onEdit(service)} title="Éditer">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => onDuplicate(service)} title="Dupliquer">
                  <Copy className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => onArchive(service)} title="Archiver">
                  <Archive className="h-4 w-4 text-orange-600" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
