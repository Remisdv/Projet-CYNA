import { ArrowLeft, Save, Globe } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { Badge } from '@/shared/components/ui/Badge';

interface Props {
  isCreate: boolean;
  serviceName?: string;
  serviceStatus?: 'draft' | 'published';
  isSubmitting: boolean;
  onCancel: () => void;
  onSaveDraft: () => void;
  onPublish: () => void;
}

export function ServiceFormHeader({ isCreate, serviceName, serviceStatus, isSubmitting, onCancel, onSaveDraft, onPublish }: Props) {
  return (
    <div className="shrink-0 flex items-center justify-between px-6 py-4 border-b bg-white">
      <div className="flex items-center gap-4">
        <button
          onClick={onCancel}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Services
        </button>
        <span className="text-gray-300">/</span>
        <h1 className="text-lg font-semibold text-gray-900">
          {isCreate ? 'Nouveau service' : `Modifier : ${serviceName || '...'}`}
        </h1>
        {!isCreate && serviceStatus && (
          <Badge variant={serviceStatus === 'published' ? 'success' : 'warning'}>
            {serviceStatus === 'published' ? 'Publié' : 'Brouillon'}
          </Badge>
        )}
      </div>
      <div className="flex items-center gap-3">
        <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Annuler
        </Button>
        <Button variant="secondary" onClick={onSaveDraft} disabled={isSubmitting}>
          <Save className="h-4 w-4 mr-2" />
          {isSubmitting ? 'Enregistrement...' : 'Brouillon'}
        </Button>
        <Button onClick={onPublish} disabled={isSubmitting}>
          <Globe className="h-4 w-4 mr-2" />
          {isSubmitting ? 'Publication...' : 'Publier'}
        </Button>
      </div>
    </div>
  );
}
