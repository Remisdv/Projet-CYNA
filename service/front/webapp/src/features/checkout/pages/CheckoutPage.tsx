import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import { useCart } from '@/shared/context/CartContext';
import { useAuth } from '@/shared/context/AuthContext';
import { useProfile } from '@/features/account/hooks/useAccount';
import { Button } from '@/shared/components/ui/Button';
import { StepIndicator } from '../components/checkoutSteps/StepIndicator';
import { Step1Info } from '../components/checkoutSteps/Step1Info';
import { Step2Summary } from '../components/checkoutSteps/Step2Summary';
import { Step3Payment } from '../components/checkoutSteps/Step3Payment';
import { Step4Confirmation } from '../components/checkoutSteps/Step4Confirmation';
import type { InfoForm } from '../types/checkout.types';

export default function CheckoutPage() {
  const { items, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { data: profile } = useProfile();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [infoData, setInfoData] = useState<InfoForm | null>(null);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [confirmOrderId, setConfirmOrderId] = useState<string | undefined>();

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
