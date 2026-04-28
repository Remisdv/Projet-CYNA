import { Check, CreditCard, User, ShoppingBag } from 'lucide-react';

const STEPS = [
  { label: 'Informations', icon: User },
  { label: 'Récapitulatif', icon: ShoppingBag },
  { label: 'Paiement', icon: CreditCard },
  { label: 'Confirmation', icon: Check },
];

export function StepIndicator({ current }: { current: number }) {
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
