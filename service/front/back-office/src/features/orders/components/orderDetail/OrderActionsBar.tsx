import { Card, CardContent } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import {
  Check, FileText, Truck, X, MessageSquarePlus, Key,
} from 'lucide-react';

interface Props {
  status: string;
  paymentStatus: string;
  hasProducts: boolean;
  hasServices: boolean;
  showTrackingInput: boolean;
  trackingNumber: string;
  setTrackingNumber: (v: string) => void;
  showCredentialsForm: boolean;
  isPendingPayment: boolean;
  isPendingStatus: boolean;
  isPendingCredentials: boolean;
  onConfirmPayment: () => void;
  onConfirmOrder: () => void;
  onGenerateInvoice: () => void;
  onMarkShipped: () => void;
  onMarkDelivered: () => void;
  onToggleCredentials: () => void;
  onCancel: () => void;
  onAddNote: () => void;
}

export function OrderActionsBar(props: Props) {
  const {
    status, paymentStatus, hasProducts, hasServices,
    showTrackingInput, trackingNumber, setTrackingNumber,
    isPendingPayment, isPendingStatus, isPendingCredentials,
    onConfirmPayment, onConfirmOrder, onGenerateInvoice,
    onMarkShipped, onMarkDelivered, onToggleCredentials, onCancel, onAddNote,
  } = props;

  return (
    <Card>
      <CardContent className="py-4">
        <div className="flex flex-wrap gap-2">
          {paymentStatus === 'pending' && (
            <Button onClick={onConfirmPayment} disabled={isPendingPayment}>
              <Check className="h-4 w-4 mr-2" />
              Confirmer paiement
            </Button>
          )}
          {status === 'pending' && paymentStatus === 'paid' && (
            <Button onClick={onConfirmOrder} disabled={isPendingStatus}>
              <Check className="h-4 w-4 mr-2" />
              Confirmer commande
            </Button>
          )}
          <Button variant="outline" onClick={onGenerateInvoice}>
            <FileText className="h-4 w-4 mr-2" />
            Générer facture PDF
          </Button>
          {status === 'confirmed' && hasProducts && (
            <Button variant="outline" onClick={onMarkShipped} disabled={isPendingStatus}>
              <Truck className="h-4 w-4 mr-2" />
              {showTrackingInput ? 'Confirmer expédition' : 'Marquer expédiée'}
            </Button>
          )}
          {showTrackingInput && (
            <Input
              placeholder="N° de suivi (optionnel)"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              className="w-64"
            />
          )}
          {status === 'shipped' && (
            <Button variant="outline" onClick={onMarkDelivered} disabled={isPendingStatus}>
              <Check className="h-4 w-4 mr-2" />
              Marquer livrée
            </Button>
          )}
          {hasServices && (status === 'confirmed' || status === 'delivered') && (
            <Button variant="outline" onClick={onToggleCredentials} disabled={isPendingCredentials}>
              <Key className="h-4 w-4 mr-2" />
              Envoyer identifiants
            </Button>
          )}
          {status !== 'cancelled' && status !== 'delivered' && (
            <Button variant="destructive" onClick={onCancel} disabled={isPendingStatus}>
              <X className="h-4 w-4 mr-2" />
              Annuler commande
            </Button>
          )}
          <Button variant="secondary" onClick={onAddNote} className="ml-auto">
            <MessageSquarePlus className="h-4 w-4 mr-2" />
            Ajouter note
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
