import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/Card';
import { User, MapPin } from 'lucide-react';
import type { OrderDetail } from '../../types/order.types';

interface Props {
  firstName: string;
  lastName: string;
  email: string;
  billingAddress: OrderDetail['billingAddress'];
}

export function OrderClientInfoCard({ firstName, lastName, email, billingAddress }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Informations client
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Nom complet</p>
            <p className="font-medium">{firstName} {lastName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Email</p>
            <p className="font-medium">{email}</p>
          </div>
        </div>
        <div className="mt-4">
          <div className="flex items-start gap-2">
            <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm text-gray-500 mb-1">Adresse de facturation</p>
              <p className="font-medium">{billingAddress.street}</p>
              <p className="font-medium">{billingAddress.postalCode} {billingAddress.city}</p>
              <p className="font-medium">{billingAddress.country}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
