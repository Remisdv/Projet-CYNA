import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/Card';
import { Badge } from '@/shared/components/ui/Badge';
import { CreditCard } from 'lucide-react';
import { getPaymentStatusBadgeVariant, getPaymentStatusLabel } from '../../lib/orderDetailLabels';

interface Props {
  paymentRef: string;
  paymentAmount: number;
  paymentStatus: string;
  paymentDate?: string | Date | null;
}

export function OrderPaymentCard({ paymentRef, paymentAmount, paymentStatus, paymentDate }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Paiement
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <p className="text-sm text-gray-500">Référence Stripe</p>
          <p className="font-mono text-sm font-medium">{paymentRef}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Montant</p>
          <p className="font-semibold text-lg">{paymentAmount.toFixed(2)} €</p>
        </div>
        <div>
          <p className="text-sm text-gray-500 mb-1">Statut</p>
          <Badge variant={getPaymentStatusBadgeVariant(paymentStatus)}>
            {getPaymentStatusLabel(paymentStatus)}
          </Badge>
        </div>
        {paymentDate && (
          <div>
            <p className="text-sm text-gray-500">Date de paiement</p>
            <p className="font-medium">
              {new Date(paymentDate).toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
