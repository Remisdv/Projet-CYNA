import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/Card';
import { Badge } from '@/shared/components/ui/Badge';
import { Button } from '@/shared/components/ui/Button';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/shared/components/ui/Table';
import { Eye, Edit, AlertTriangle } from 'lucide-react';
import { formatEur, getStatusBadgeVariant, getStatusLabel } from '../lib/dashboardLabels';

interface Order {
  id: string | number;
  client: string;
  amount: number | string;
  status: string;
  date: string;
}

interface User {
  id: string | number;
  email: string;
  name: string;
  registeredAt: string;
  status: string;
}

interface OOSProduct {
  id: string | number;
  name: string;
  stock: number;
}

export function RecentOrdersTable({ orders }: { orders: Order[] }) {
  const navigate = useNavigate();
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Dernières Commandes</CardTitle>
        <Button variant="ghost" size="sm" className="text-blue-600" onClick={() => navigate('/orders')}>
          Voir tout
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Client</TableHead>
              <TableHead>Montant</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">{order.client}</TableCell>
                <TableCell>{formatEur(parseFloat(String(order.amount)))}</TableCell>
                <TableCell>
                  <Badge variant={getStatusBadgeVariant(order.status)}>
                    {getStatusLabel(order.status)}
                  </Badge>
                </TableCell>
                <TableCell className="text-gray-500">
                  {new Date(order.date).toLocaleDateString('fr-FR')}
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm" onClick={() => navigate(`/orders/${order.id}`)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export function RecentUsersTable({ users }: { users: User[] }) {
  const navigate = useNavigate();
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Clients Webapp Récents</CardTitle>
        <Button variant="ghost" size="sm" className="text-blue-600" onClick={() => navigate('/users')}>
          Voir tout
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Nom</TableHead>
              <TableHead>Inscription</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.email}</TableCell>
                <TableCell>{user.name}</TableCell>
                <TableCell className="text-gray-500">
                  {new Date(user.registeredAt).toLocaleDateString('fr-FR')}
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusBadgeVariant(user.status)}>
                    {getStatusLabel(user.status)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export function OutOfStockTable({ products }: { products: OOSProduct[] }) {
  const navigate = useNavigate();
  return (
    <Card className="border-red-200 bg-red-50">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-red-900 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Produits en rupture de stock
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="bg-red-100">
              <TableHead>Produit</TableHead>
              <TableHead>Stock Actuel</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id} className="bg-white">
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>
                  <Badge variant={product.stock === 0 ? 'destructive' : 'warning'}>
                    {product.stock} unité{product.stock !== 1 ? 's' : ''}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button variant="outline" size="sm" className="flex items-center gap-1" onClick={() => navigate(`/catalog/services/${product.id}/edit`)}>
                    <Edit className="h-4 w-4" />
                    Éditer
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
