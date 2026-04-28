import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Check, CreditCard, User, ShoppingBag, PartyPopper, Loader2 } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardNumberElement, CardExpiryElement, CardCvcElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useCart } from '@/shared/context/CartContext';
import { useAuth } from '@/shared/context/AuthContext';
import { useProfile } from '@/features/account/hooks/useAccount';
import { Input } from '@/shared/components/ui/Input';
import { Button } from '@/shared/components/ui/Button';
import { useCreatePaymentIntent, useConfirmPayment } from '../hooks/usePayment';
import { trackEvent } from '@/shared/lib/tracking';

const stripePromise = loadStripe(
  (import.meta as any).env?.VITE_STRIPE_PK || '',
);

/* ─── Step schemas ──────────────────────────────────────────────── */
const infoSchema = z.object({
  prenom: z.string().min(1, 'Prénom requis'),
  nom: z.string().min(1, 'Nom requis'),
  email: z.string().email('Email invalide'),
  telephone: z.string().optional(),
  adresse: z.string().min(1, 'Adresse requise'),
  ville: z.string().min(1, 'Ville requise'),
  codePostal: z.string().min(4, 'Code postal invalide'),
  pays: z.string().min(1, 'Pays requis'),
});
type InfoForm = z.infer<typeof infoSchema>;

/* ─── Step indicator ─────────────────────────────────────────────── */
const STEPS = [
  { label: 'Informations', icon: User },
  { label: 'Récapitulatif', icon: ShoppingBag },
  { label: 'Paiement', icon: CreditCard },
  { label: 'Confirmation', icon: Check },
];

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="mb-10 flex items-center justify-center gap-0">
      {STEPS.map((step, i) => {
        const done = i < current;
        const active = i === current;
        const Icon = step.icon;
        return (
          <div key={i} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition ${done
                  ? 'border-blue-600 bg-blue-600 text-white'
                  : active
                    ? 'border-blue-600 bg-white text-blue-600'
                    : 'border-gray-300 bg-white text-gray-400'
                  }`}
              >
                {done ? <Check size={18} /> : <Icon size={18} />}
              </div>
              <span
                className={`mt-1 text-xs font-medium ${active ? 'text-blue-600' : done ? 'text-blue-500' : 'text-gray-400'
                  }`}
              >
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`mx-2 mb-5 h-0.5 w-12 sm:w-20 ${i < current ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ─── Step 1 — Contact / Address info ───────────────────────────── */
function Step1Info({
  onNext,
  defaults,
}: {
  onNext: (data: InfoForm) => void;
  defaults?: Partial<InfoForm>;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<InfoForm>({
    resolver: zodResolver(infoSchema),
    defaultValues: defaults,
  });

  // Reset form when defaults arrive (profile loaded async)
  useEffect(() => {
    if (defaults) reset(defaults);
  }, [defaults, reset]);

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-4">
      <h2 className="text-xl font-bold text-gray-900">Vos informations</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Prénom *</label>
          <Input {...register('prenom')} placeholder="Jean" />
          {errors.prenom && <p className="mt-1 text-xs text-red-500">{errors.prenom.message}</p>}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Nom *</label>
          <Input {...register('nom')} placeholder="Dupont" />
          {errors.nom && <p className="mt-1 text-xs text-red-500">{errors.nom.message}</p>}
        </div>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Email *</label>
        <Input {...register('email')} type="email" placeholder="jean.dupont@exemple.fr" />
        {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Téléphone</label>
        <Input {...register('telephone')} type="tel" placeholder="+33 6 12 34 56 78" />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Adresse *</label>
        <Input {...register('adresse')} placeholder="12 rue de la Paix" />
        {errors.adresse && <p className="mt-1 text-xs text-red-500">{errors.adresse.message}</p>}
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="col-span-1">
          <label className="mb-1 block text-sm font-medium text-gray-700">Code postal *</label>
          <Input {...register('codePostal')} placeholder="75001" />
          {errors.codePostal && (
            <p className="mt-1 text-xs text-red-500">{errors.codePostal.message}</p>
          )}
        </div>
        <div className="col-span-1 sm:col-span-2">
          <label className="mb-1 block text-sm font-medium text-gray-700">Ville *</label>
          <Input {...register('ville')} placeholder="Paris" />
          {errors.ville && <p className="mt-1 text-xs text-red-500">{errors.ville.message}</p>}
        </div>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Pays *</label>
        <Input {...register('pays')} defaultValue="France" placeholder="France" />
        {errors.pays && <p className="mt-1 text-xs text-red-500">{errors.pays.message}</p>}
      </div>
      <Button type="submit" className="w-full">Continuer</Button>
    </form>
  );
}

/* ─── Step 2 — Order summary ─────────────────────────────────────── */
function Step2Summary({
  info,
  onNext,
  onBack,
}: {
  info: InfoForm;
  onNext: () => void;
  onBack: () => void;
}) {
  const { items, total } = useCart();

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900">Récapitulatif de commande</h2>

      {/* Contact info recap */}
      <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
        <h3 className="mb-2 text-sm font-semibold text-gray-500 uppercase">Livraison / Contact</h3>
        <p className="text-sm text-gray-700">
          {info.prenom} {info.nom}
        </p>
        <p className="text-sm text-gray-500">{info.email}</p>
        <p className="text-sm text-gray-500">{info.adresse}, {info.codePostal} {info.ville}</p>
      </div>

      {/* Items */}
      <div className="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white">
        {items.map(item => {
          const unitPrice = item.type === 'service'
            ? (item.periodicity === 'mensuel' ? item.prix_mensuel : item.prix_annuel)
            : item.prix;
          const lineTotal = unitPrice != null ? unitPrice * item.quantity : null;
          return (
            <div key={item.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-sm font-medium text-gray-900">{item.nom}</p>
                <p className="text-xs text-gray-400">
                  × {item.quantity}
                  {item.type === 'service' && ` — ${item.periodicity}`}
                </p>
              </div>
              <span className="text-sm font-semibold text-blue-600">
                {lineTotal != null ? `${lineTotal.toFixed(2)} €` : '—'}
              </span>
            </div>
          );
        })}
        <div className="flex justify-between px-4 py-3 font-bold text-gray-900">
          <span>Total estimé</span>
          <span>{total.toFixed(2)} €</span>
        </div>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="flex-1">Retour</Button>
        <Button onClick={onNext} className="flex-1">Procéder au paiement</Button>
      </div>
    </div>
  );
}

/* ─── Step 3 — Payment with Stripe Elements ──────────────────────── */
function Step3PaymentInner({
  info,
  onNext,
  onBack,
}: {
  info: InfoForm;
  onNext: (orderRef: string, orderId?: string) => void;
  onBack: () => void;
}) {
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

      // 1. Create PaymentIntent on server → get clientSecret
      const result = await createPayment.mutateAsync({
        items: paymentItems,
        billingAddress,
        shippingAddress: billingAddress,
      });

      const clientSecret = result.clientSecret;

      if (!clientSecret) {
        // Subscription-only or no secret → proceed directly
        onNext(result.message || 'Commande créée', result.orderId ? String(result.orderId) : undefined);
        return;
      }

      // 2. Confirm payment with Stripe.js using card element
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
        // Confirm order: sends emails + syncs to service-api for BO
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
          <CardNumberElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#1f2937',
                  '::placeholder': { color: '#9ca3af' },
                },
                invalid: { color: '#dc2626' },
              },
            }}
          />
        </div>

        <div className="flex gap-3">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date d'expiration
            </label>
            <div className="rounded-lg border border-gray-300 p-3 bg-gray-50">
              <CardExpiryElement
                options={{
                  style: {
                    base: {
                      fontSize: '16px',
                      color: '#1f2937',
                      '::placeholder': { color: '#9ca3af' },
                    },
                    invalid: { color: '#dc2626' },
                  },
                }}
              />
            </div>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              CVC
            </label>
            <div className="rounded-lg border border-gray-300 p-3 bg-gray-50">
              <CardCvcElement
                options={{
                  style: {
                    base: {
                      fontSize: '16px',
                      color: '#1f2937',
                      '::placeholder': { color: '#9ca3af' },
                    },
                    invalid: { color: '#dc2626' },
                  },
                }}
              />
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

function Step3Payment(props: {
  info: InfoForm;
  onNext: (orderRef: string, orderId?: string) => void;
  onBack: () => void;
}) {
  return (
    <Elements stripe={stripePromise}>
      <Step3PaymentInner {...props} />
    </Elements>
  );
}

/* ─── Step 4 — Confirmation ──────────────────────────────────────── */
function Step4Confirmation({ info, message, orderId }: { info: InfoForm; message: string; orderId?: string }) {
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

/* ─── Main CheckoutPage ──────────────────────────────────────────── */
export default function CheckoutPage() {
  const { items, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { data: profile } = useProfile();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [infoData, setInfoData] = useState<InfoForm | null>(null);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [confirmOrderId, setConfirmOrderId] = useState<string | undefined>();

  // Build default values from profile
  const profileDefaults: Partial<InfoForm> | undefined = profile
    ? {
      prenom: profile.firstName || '',
      nom: profile.lastName || '',
      email: profile.email || '',
      telephone: profile.phone || '',
      adresse: profile.billingAddress?.street || '',
      ville: profile.billingAddress?.city || '',
      codePostal: profile.billingAddress?.postalCode || '',
      pays: profile.billingAddress?.country || 'France',
    }
    : undefined;

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  if (items.length === 0 && step < 3) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <ShoppingBag size={56} className="mx-auto mb-4 text-gray-300" />
        <p className="text-gray-500">Votre panier est vide.</p>
        <Button className="mt-4" onClick={() => navigate('/catalog')}>
          Voir le catalogue
        </Button>
      </div>
    );
  }

  function handleInfoNext(data: InfoForm) {
    setInfoData(data);
    setStep(1);
  }

  function handlePaymentNext(msg: string, orderId?: string) {
    setConfirmMessage(msg);
    setConfirmOrderId(orderId);
    clearCart();
    setStep(3);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <StepIndicator current={step} />
      {step === 0 && <Step1Info onNext={handleInfoNext} defaults={profileDefaults} />}
      {step === 1 && infoData && (
        <Step2Summary info={infoData} onNext={() => setStep(2)} onBack={() => setStep(0)} />
      )}
      {step === 2 && infoData && (
        <Step3Payment info={infoData} onNext={handlePaymentNext} onBack={() => setStep(1)} />
      )}
      {step === 3 && infoData && <Step4Confirmation info={infoData} message={confirmMessage} orderId={confirmOrderId} />}
    </div>
  );
}
