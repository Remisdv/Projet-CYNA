import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/Card';
import { Badge } from '@/shared/components/ui/Badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/shared/components/ui/Table';
import { Package, Monitor } from 'lucide-react';

import type { OrderItem } from '../../types/order.types';

interface Props {
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
}

export function OrderItemsCard({ items, subtotal, tax, total }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Articles commandés
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Produit</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-center">Quantité</TableHead>
              <TableHead className="text-right">Prix unitaire</TableHead>
              <TableHead className="text-right">Sous-total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.productName}</TableCell>
                <TableCell>
                  <Badge variant={item.productType === 'service' ? 'secondary' : 'default'}>
                    {item.productType === 'service' ? (
                      <><Monitor className="h-3 w-3 mr-1 inline" />Service</>
                    ) : (
                      <><Package className="h-3 w-3 mr-1 inline" />Produit</>
                    )}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">{item.quantity}</TableCell>
                <TableCell className="text-right">{item.unitPrice.toFixed(2)} €</TableCell>
                <TableCell className="text-right font-semibold">{item.subtotal.toFixed(2)} €</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="mt-6 border-t pt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Sous-total</span>
            <span className="font-medium">{subtotal.toFixed(2)} €</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">TVA (20%)</span>
            <span className="font-medium">{tax.toFixed(2)} €</span>
          </div>
          <div className="flex justify-between text-lg font-bold border-t pt-2">
            <span>Montant total</span>
            <span className="text-blue-600">{total.toFixed(2)} €</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
