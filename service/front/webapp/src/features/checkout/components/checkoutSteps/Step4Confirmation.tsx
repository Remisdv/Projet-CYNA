import { useNavigate } from 'react-router-dom';
import { PartyPopper } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import type { InfoForm } from '../../types/checkout.types';

export function Step4Confirmation({ info, message, orderId }: { info: InfoForm; message: string; orderId?: string }) {
  const navigate = useNavigate();

  return (
    <div className="py-8 text-center">
      <PartyPopper size={56} className="mx-auto mb-4 text-blue-600" />
      <h2 className="mb-2 text-2xl font-bold text-gray-900">Commande confirmée !</h2>
      <p className="mb-1 text-gray-600">
        Merci, <strong>{info.prenom}</strong>. Votre commande a bien été prise en compte.
      </p>
      <p className="mb-6 text-sm text-gray-400">{message}</p>
      <p className="mb-8 text-sm text-gray-500">
        Un email de confirmation a été envoyé à <strong>{info.email}</strong>.
      </p>
      <div className="flex justify-center gap-4">
        <Button variant="outline" onClick={() => navigate('/catalog')}>
          Continuer mes achats
        </Button>
        {orderId && (
          <Button variant="outline" onClick={() => navigate(`/orders/${orderId}`)}>
            Suivre ma commande
          </Button>
        )}
        <Button onClick={() => navigate('/account')}>Mon compte</Button>
      </div>
    </div>
  );
}
