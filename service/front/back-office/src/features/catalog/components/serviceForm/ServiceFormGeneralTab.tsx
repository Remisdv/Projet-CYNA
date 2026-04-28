import { Input } from '@/shared/components/ui/Input';
import { Textarea } from '@/shared/components/ui/Textarea';
import { Select } from '@/shared/components/ui/Select';
import { availableTags } from '../../types/serviceForm.types';
import type { ServiceFormData } from '../../types/serviceForm.types';

interface Props {
  formData: ServiceFormData;
  errors: Partial<Record<keyof ServiceFormData, string>>;
  categories: { value: string; label: string }[];
  updateField: <K extends keyof ServiceFormData>(field: K, value: ServiceFormData[K]) => void;
  toggleTag: (tag: string) => void;
}

export function ServiceFormGeneralTab({ formData, errors, categories, updateField, toggleTag }: Props) {
  return (
    <>
      <Input
        label="Nom *"
        value={formData.name}
        onChange={e => updateField('name', e.target.value)}
        error={errors.name}
        placeholder="Nom du service / produit"
      />

      <Textarea
        label={`Description courte (${formData.shortDescription.length}/100 caractères)`}
        value={formData.shortDescription}
        onChange={e => updateField('shortDescription', e.target.value.slice(0, 100))}
        placeholder="Brève description visible dans les listes"
        rows={3}
      />

      <Textarea
        label="Description longue (Markdown supporté)"
        value={formData.longDescription}
        onChange={e => updateField('longDescription', e.target.value)}
        placeholder="Description détaillée. Supporte **gras**, *italique*, # titres, - listes..."
        rows={8}
      />

      <div className="grid grid-cols-2 gap-6">
        <Select
          label="Catégorie *"
          value={formData.category}
          onChange={e => updateField('category', e.target.value)}
          error={errors.category}
          options={categories}
        />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
          <div className="flex gap-2">
            {(['product', 'service'] as const).map(t => (
              <button
                key={t}
                type="button"
                onClick={() => updateField('type', t)}
                className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${formData.type === t ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                {t === 'product' ? 'Produit' : 'Service'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
        <div className="flex flex-wrap gap-2">
          {availableTags.map(tag => (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              className={`px-3 py-1.5 rounded-full text-sm transition-colors border ${formData.tags.includes(tag)
                  ? 'bg-blue-100 text-blue-800 border-blue-300'
                  : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
