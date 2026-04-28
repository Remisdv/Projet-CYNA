import { Input } from '@/shared/components/ui/Input';
import type { ServiceFormData, RawValuesState } from '../../types/serviceForm.types';

interface Props {
  formData: ServiceFormData;
  rawValues: RawValuesState;
  setRaw: (field: keyof RawValuesState, value: string) => void;
  updateField: <K extends keyof ServiceFormData>(field: K, value: ServiceFormData[K]) => void;
}

export function ServiceFormStockTab({ formData, rawValues, setRaw, updateField }: Props) {
  return (
    <>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Quantité disponible</label>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => {
              if (formData.stockQuantity === 'unlimited') {
                const n = parseInt(rawValues.stockQuantity) || 0;
                updateField('stockQuantity', n);
              } else {
                updateField('stockQuantity', 'unlimited');
              }
            }}
            className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-colors ${formData.stockQuantity === 'unlimited' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
          >
            Illimité
          </button>
          <span className="text-gray-400">ou</span>
          <div className="flex-1">
            <Input
              type="number"
              min="0"
              value={formData.stockQuantity === 'unlimited' ? '' : rawValues.stockQuantity}
              onChange={e => { setRaw('stockQuantity', e.target.value); updateField('stockQuantity', parseInt(e.target.value) || 0); }}
              onBlur={() => { if (formData.stockQuantity !== 'unlimited') setRaw('stockQuantity', String(formData.stockQuantity)); }}
              placeholder="Quantité"
              disabled={formData.stockQuantity === 'unlimited'}
            />
          </div>
        </div>
      </div>
      <Input
        label="Seuil d'alerte stock bas"
        type="number"
        min="0"
        value={rawValues.lowStockThreshold}
        onChange={e => { setRaw('lowStockThreshold', e.target.value); updateField('lowStockThreshold', parseInt(e.target.value) || 0); }}
        onBlur={() => setRaw('lowStockThreshold', String(formData.lowStockThreshold))}
        placeholder="10"
      />
    </>
  );
}
