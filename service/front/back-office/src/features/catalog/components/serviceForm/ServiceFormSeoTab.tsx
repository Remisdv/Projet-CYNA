import { Input } from '@/shared/components/ui/Input';
import { Textarea } from '@/shared/components/ui/Textarea';
import { Badge } from '@/shared/components/ui/Badge';
import type { ServiceFormData } from '../../types/serviceForm.types';

interface Props {
  formData: ServiceFormData;
  updateField: <K extends keyof ServiceFormData>(field: K, value: ServiceFormData[K]) => void;
}

export function ServiceFormSeoTab({ formData, updateField }: Props) {
  return (
    <>
      <div>
        <Input
          label="Slug URL"
          value={formData.slug}
          onChange={e => updateField('slug', e.target.value)}
          placeholder="mon-service"
        />
        <p className="mt-1 text-xs text-gray-500">URL : /services/{formData.slug || 'mon-service'}</p>
      </div>

      <div>
        <Input
          label={`Meta Title (${formData.metaTitle.length}/60)`}
          value={formData.metaTitle}
          onChange={e => updateField('metaTitle', e.target.value.slice(0, 60))}
          placeholder="Titre affiché dans les résultats Google"
        />
      </div>

      <Textarea
        label={`Meta Description (${formData.metaDescription.length}/160)`}
        value={formData.metaDescription}
        onChange={e => updateField('metaDescription', e.target.value.slice(0, 160))}
        placeholder="Description affichée sous le titre dans Google"
        rows={4}
      />

      <div>
        <Input
          label="Keywords (séparés par des virgules)"
          value={formData.keywords}
          onChange={e => updateField('keywords', e.target.value)}
          placeholder="cybersecurity, protection, SOC"
        />
        {formData.keywords && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {formData.keywords.split(',').map((kw, i) => kw.trim() && (
              <Badge key={i} variant="secondary" className="text-xs">{kw.trim()}</Badge>
            ))}
          </div>
        )}
      </div>

      {/* Google preview */}
      <div className="border rounded-xl p-5 bg-gray-50">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Aperçu Google</h4>
        <p className="text-blue-700 text-base font-medium">{formData.metaTitle || 'Titre du service'}</p>
        <p className="text-green-700 text-sm">https://cyna.com/services/{formData.slug || '...'}</p>
        <p className="text-gray-600 text-sm mt-1 leading-relaxed">{formData.metaDescription || 'Description qui apparaît sous le titre dans les résultats de recherche.'}</p>
      </div>
    </>
  );
}
