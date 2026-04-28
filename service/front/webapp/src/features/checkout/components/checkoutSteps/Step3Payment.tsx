import { useState } from 'react';
import { CreditCard, Loader2 } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements, CardNumberElement, CardExpiryElement, CardCvcElement, useStripe, useElements,
} from '@stripe/react-stripe-js';
import { Button } from '@/shared/components/ui/Button';
import { useCart } from '@/shared/context/CartContext';
import { useCreatePaymentIntent, useConfirmPayment } from '../../hooks/usePayment';
import { trackEvent } from '@/shared/lib/tracking';
import type { InfoForm } from '../../types/checkout.types';

const stripePromise = loadStripe(
  (import.meta as any).env?.VITE_STRIPE_PK || '',
);

interface Step3Props {
  info: InfoForm;
  onNext: (orderRef: string, orderId?: string) => void;
  onBack: () => void;
}

function Step3PaymentInner({ info, onNext, onBack }: Step3Props) {
  const { items } = useCart();
  const createPayment = useCreatePaymentIntent();
  const confirmPayment = useConfirmPayment();
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);

  const handlePay = async () => {
    if (!stripe || !elements) return;

    try {
      setError('');
      setProcessing(true);

      const billingAddress = {
        street: info.adresse,
        city: info.ville,
        postalCode: info.codePostal,
        country: info.pays,
      };

      const paymentItems = items.map((item) => ({
        productId: item.id,
        productName: item.nom,
        productType: item.type as 'produit' | 'service',
        quantity: item.quantity,
        unitPrice:
          item.type === 'service'
            ? (item.periodicity === 'mensuel' ? item.prix_mensuel ?? 0 : item.prix_annuel ?? 0)
            : item.prix ?? 0,
        periodicity: item.type === 'service' ? item.periodicity : undefined,
      }));

      const result = await createPayment.mutateAsync({
        items: paymentItems,
        billingAddress,
        shippingAddress: billingAddress,
      });

      const clientSecret = result.clientSecret;

      if (!clientSecret) {
        onNext(result.message || 'Commande créée', result.orderId ? String(result.orderId) : undefined);
        return;
      }

      const cardElement = elements.getElement(CardNumberElement);
      if (!cardElement) {
        setError('Élément de carte introuvable');
        return;
      }

      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: `${info.prenom} ${info.nom}`,
              email: info.email,
              phone: info.telephone || undefined,
              address: {
                line1: info.adresse,
                city: info.ville,
                postal_code: info.codePostal,
                country: 'FR',
              },
            },
          },
        },
      );

      if (stripeError) {
        setError(stripeError.message || 'Erreur de paiement');
        return;
      }

      if (paymentIntent?.status === 'succeeded') {
        if (result.orderId) {
          try {
            await confirmPayment.mutateAsync(String(result.orderId));
          } catch (e) {
            console.error('Order confirmation failed:', e);
          }
        }
        trackEvent('CART_CHECKOUT', undefined, { orderRef: result.orderRef });
        onNext(result.orderRef || 'Paiement confirmé !', result.orderId ? String(result.orderId) : undefined);
      } else {
        onNext(`Paiement en cours de traitement (${paymentIntent?.status})`, result.orderId ? String(result.orderId) : undefined);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Erreur lors du paiement');
    } finally {
      setProcessing(false);
    }
  };

  const cardStyle = {
    style: {
      base: {
        fontSize: '16px',
        color: '#1f2937',
        '::placeholder': { color: '#9ca3af' },
      },
      invalid: { color: '#dc2626' },
    },
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-900">Paiement sécurisé</h2>
      <div className="rounded-lg border border-blue-100 bg-blue-50 p-3 text-xs text-blue-700">
        Mode sandbox Stripe — aucune transaction réelle ne sera effectuée.
        <br />
        Carte de test : <code className="font-mono">4242 4242 4242 4242</code> — date future — CVC quelconque
      </div>

      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg">{error}</div>
      )}

      <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-3">
        <p className="text-sm text-gray-600">
          Adresse : {info.adresse}, {info.codePostal} {info.ville}
        </p>
        <p className="text-sm text-gray-600 mb-2">Email : {info.email}</p>

        <label className="block text-sm font-medium text-gray-700 mb-1">
          Numéro de carte
        </label>
        <div className="rounded-lg border border-gray-300 p-3 bg-gray-50 mb-3">
          <CardNumberElement options={cardStyle} />
        </div>

        <div className="flex gap-3">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date d'expiration
            </label>
            <div className="rounded-lg border border-gray-300 p-3 bg-gray-50">
              <CardExpiryElement options={cardStyle} />
            </div>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              CVC
            </label>
            <div className="rounded-lg border border-gray-300 p-3 bg-gray-50">
              <CardCvcElement options={cardStyle} />
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={onBack} className="flex-1">
          Retour
        </Button>
        <Button onClick={handlePay} className="flex-1" disabled={processing || !stripe}>
          <CreditCard size={16} className="mr-2" />
          {processing ? (
            <>
              <Loader2 size={16} className="mr-2 animate-spin" />
              Traitement…
            </>
          ) : (
            'Payer'
          )}
        </Button>
      </div>
    </div>
  );
}

export function Step3Payment(props: Step3Props) {
  return (
    <Elements stripe={stripePromise}>
      <Step3PaymentInner {...props} />
    </Elements>
  );
}
