import type { RefObject } from 'react';
import { Image as ImageIcon, X, Star, Plus, Upload } from 'lucide-react';
import { Input } from '@/shared/components/ui/Input';
import { Button } from '@/shared/components/ui/Button';
import { Badge } from '@/shared/components/ui/Badge';
import type { ServiceFormData } from '../../types/serviceForm.types';

interface Props {
  formData: ServiceFormData;
  imageUrlInput: string;
  setImageUrlInput: (v: string) => void;
  isUploading: boolean;
  fileInputRef: RefObject<HTMLInputElement>;
  handleFileUpload: (files: FileList | File[]) => void | Promise<void>;
  addImageUrl: () => void;
  removeImage: (id: string) => void;
  setPrimaryImage: (id: string) => void;
}

export function ServiceFormImagesTab({
  formData, imageUrlInput, setImageUrlInput, isUploading, fileInputRef,
  handleFileUpload, addImageUrl, removeImage, setPrimaryImage,
}: Props) {
  return (
    <>
      {/* Upload zone */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Upload d'images</label>
        <label
          className={`flex items-center justify-center w-full h-36 px-4 transition bg-white border-2 border-dashed rounded-xl cursor-pointer ${isUploading ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
            }`}
          onDragOver={e => { e.preventDefault(); e.stopPropagation(); }}
          onDrop={e => { e.preventDefault(); e.stopPropagation(); if (e.dataTransfer.files.length) handleFileUpload(e.dataTransfer.files); }}
        >
          <div className="flex flex-col items-center gap-2">
            <Upload className={`h-9 w-9 ${isUploading ? 'text-blue-500 animate-pulse' : 'text-gray-400'}`} />
            <span className="text-sm font-medium text-gray-600">
              {isUploading ? 'Upload en cours...' : 'Glissez-déposez ou cliquez pour sélectionner'}
            </span>
            <span className="text-xs text-gray-400">PNG, JPG, GIF, WEBP · max 5 Mo</span>
          </div>
          <input ref={fileInputRef} type="file" className="hidden" accept="image/*" multiple
            onChange={e => { if (e.target.files?.length) handleFileUpload(e.target.files); }} />
        </label>
      </div>

      {/* URL input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Ou ajouter par URL</label>
        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              value={imageUrlInput}
              onChange={e => setImageUrlInput(e.target.value)}
              placeholder="https://example.com/image.jpg"
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addImageUrl(); } }}
            />
          </div>
          <Button onClick={addImageUrl} disabled={!imageUrlInput.trim()}>
            <Plus className="h-4 w-4 mr-1" />Ajouter
          </Button>
        </div>
      </div>

      {formData.images.length > 0 ? (
        <div>
          <p className="text-xs text-gray-500 mb-3">Cliquez sur l'étoile pour définir l'image principale.</p>
          <div className="grid grid-cols-3 gap-4">
            {formData.images.map(image => (
              <div key={image.id} className={`relative group rounded-xl overflow-hidden border-2 ${image.isPrimary ? 'border-blue-500' : 'border-gray-200'}`}>
                <img
                  src={image.url}
                  alt={image.altText}
                  className="w-full h-32 object-cover"
                  onError={e => { (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="128" fill="%23f3f4f6"><rect width="200" height="128"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%239ca3af" font-size="12">Image invalide</text></svg>'; }}
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button type="button" onClick={() => setPrimaryImage(image.id)}
                    className={`p-2 rounded-full ${image.isPrimary ? 'bg-yellow-500 text-white' : 'bg-white text-gray-700 hover:bg-yellow-100'}`}>
                    <Star className={`h-4 w-4 ${image.isPrimary ? 'fill-current' : ''}`} />
                  </button>
                  <button type="button" onClick={() => removeImage(image.id)} className="p-2 bg-white text-red-600 rounded-full hover:bg-red-50">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                {image.isPrimary && (
                  <div className="absolute top-1.5 right-1.5"><Badge variant="default" className="text-[10px]">Principale</Badge></div>
                )}
                {image.isNew && (
                  <div className="absolute top-1.5 left-1.5"><Badge variant="secondary" className="text-[10px]">Nouvelle</Badge></div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-12 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
          <ImageIcon className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p className="font-medium">Aucune image ajoutée</p>
          <p className="text-sm mt-1">Uploadez ou ajoutez une URL ci-dessus</p>
        </div>
      )}
    </>
  );
}
