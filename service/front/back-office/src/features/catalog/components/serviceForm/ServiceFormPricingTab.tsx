import { Info } from 'lucide-react';
import { Input } from '@/shared/components/ui/Input';
import type { ServiceFormData, RawValuesState } from '../../types/serviceForm.types';

interface Props {
  formData: ServiceFormData;
  errors: Partial<Record<keyof ServiceFormData, string>>;
  rawValues: RawValuesState;
  setRaw: (field: keyof RawValuesState, value: string) => void;
  updateField: <K extends keyof ServiceFormData>(field: K, value: ServiceFormData[K]) => void;
  annualDiscount: number;
}

export function ServiceFormPricingTab({ formData, errors, rawValues, setRaw, updateField, annualDiscount }: Props) {
  if (formData.type === 'product') {
    return (
      <div>
        <h3 className="text-base font-semibold text-gray-900 mb-4">Prix unique</h3>
        <Input
          label="Prix (€) *"
          type="number"
          step="0.01"
          min="0"
          value={rawValues.price}
          onChange={e => { setRaw('price', e.target.value); updateField('price', parseFloat(e.target.value) || 0); }}
          onBlur={() => setRaw('price', String(formData.price))}
          error={errors.price}
          placeholder="99.99"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-base font-semibold text-gray-900">Tarification Abonnement</h3>
      <div className="grid grid-cols-2 gap-6">
        <Input
          label="Prix mensuel (€) *"
          type="number"
          step="0.01"
          min="0"
          value={rawValues.monthlyPrice}
          onChange={e => { setRaw('monthlyPrice', e.target.value); updateField('monthlyPrice', parseFloat(e.target.value) || 0); }}
          onBlur={() => setRaw('monthlyPrice', String(formData.monthlyPrice))}
          error={errors.monthlyPrice}
          placeholder="49.99"
        />
        <Input
          label="Prix annuel (€) *"
          type="number"
          step="0.01"
          min="0"
          value={rawValues.annualPrice}
          onChange={e => { setRaw('annualPrice', e.target.value); updateField('annualPrice', parseFloat(e.target.value) || 0); }}
          onBlur={() => setRaw('annualPrice', String(formData.annualPrice))}
          error={errors.annualPrice}
          placeholder="509.99"
        />
      </div>
      {formData.monthlyPrice > 0 && formData.annualPrice > 0 && annualDiscount > 0 && (
        <div className="p-4 rounded-xl bg-green-50 border border-green-200">
          <div className="flex items-center gap-2">
            <Info className="h-5 w-5 text-green-600" />
            <span className="text-sm font-semibold text-green-800">
              Économisez {annualDiscount}% avec l'abonnement annuel
            </span>
          </div>
          <p className="mt-1 text-sm text-green-600">
            {(formData.monthlyPrice * 12).toFixed(2)} €/an → {formData.annualPrice.toFixed(2)} €/an
          </p>
        </div>
      )}
    </div>
  );
}
