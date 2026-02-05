import { useState } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { Button } from './Button';
import api from '../../services/api';

interface UploadedImage {
  id: string;
  url: string;
  filename: string;
  mimetype: string;
  size: number;
}

interface ImageUploadProps {
  onImagesUploaded: (images: UploadedImage[]) => void;
  maxFiles?: number;
  existingImages?: Array<{ url: string; altText?: string }>;
  onRemoveExisting?: (index: number) => void;
}

export function ImageUpload({
  onImagesUploaded,
  maxFiles = 10,
  existingImages = [],
  onRemoveExisting,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [previews, setPreviews] = useState<Array<{ file: File; preview: string }>>([]);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const totalImages = existingImages.length + previews.length + files.length;
    if (totalImages > maxFiles) {
      setError(`Vous ne pouvez télécharger que ${maxFiles} images maximum`);
      return;
    }

    setError(null);

    const newPreviews = Array.from(files).map(file => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setPreviews(prev => [...prev, ...newPreviews]);
  };

  const removePreview = (index: number) => {
    setPreviews(prev => {
      const updated = [...prev];
      URL.revokeObjectURL(updated[index].preview);
      updated.splice(index, 1);
      return updated;
    });
  };

  const handleUpload = async () => {
    if (previews.length === 0) {
      setError('Veuillez sélectionner au moins une image');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      previews.forEach(({ file }) => {
        formData.append('images', file);
      });

      const response = await api.post('/api/bo/services/upload-images', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data && response.data.images) {
        const uploaded = response.data.images;
        setUploadedImages(prev => [...prev, ...uploaded]);
        onImagesUploaded(uploaded);

        // Clear previews
        previews.forEach(({ preview }) => URL.revokeObjectURL(preview));
        setPreviews([]);
      }
    } catch (err: any) {
      console.error('Upload failed:', err);
      setError(
        err.response?.data?.message ||
        'Erreur lors du téléchargement des images'
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* File Input */}
      <div className="flex items-center gap-3">
        <label className="flex-1">
          <div className="flex items-center justify-center w-full h-32 px-4 transition bg-white border-2 border-gray-300 border-dashed rounded-lg appearance-none cursor-pointer hover:border-gray-400 focus:outline-none">
            <div className="flex flex-col items-center space-y-2">
              <Upload className="w-8 h-8 text-gray-400" />
              <span className="text-sm text-gray-600">
                Cliquez pour sélectionner des images
              </span>
              <span className="text-xs text-gray-500">
                PNG, JPG, GIF, WEBP (max {maxFiles} images)
              </span>
            </div>
          </div>
          <input
            type="file"
            className="hidden"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            disabled={uploading}
          />
        </label>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
          {error}
        </div>
      )}

      {/* Preview Section */}
      {previews.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-700">
              Images sélectionnées ({previews.length})
            </h4>
            <Button
              type="button"
              size="sm"
              onClick={handleUpload}
              disabled={uploading}
            >
              {uploading ? 'Téléchargement...' : 'Télécharger'}
            </Button>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {previews.map((item, idx) => (
              <div key={idx} className="relative group">
                <img
                  src={item.preview}
                  alt={`Preview ${idx + 1}`}
                  className="w-full h-24 object-cover rounded-lg border border-gray-200"
                />
                <button
                  type="button"
                  onClick={() => removePreview(idx)}
                  className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  disabled={uploading}
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="absolute bottom-1 left-1 right-1 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded truncate">
                  {item.file.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Existing Images */}
      {existingImages.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">
            Images existantes ({existingImages.length})
          </h4>
          <div className="grid grid-cols-4 gap-3">
            {existingImages.map((image, idx) => (
              <div key={idx} className="relative group">
                <img
                  src={image.url}
                  alt={image.altText || `Image ${idx + 1}`}
                  className="w-full h-24 object-cover rounded-lg border border-gray-200"
                />
                {onRemoveExisting && (
                  <button
                    type="button"
                    onClick={() => onRemoveExisting(idx)}
                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                <div className="absolute bottom-1 left-1 right-1 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                  <ImageIcon className="w-3 h-3" />
                  <span className="truncate">{image.altText || 'Image'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Uploaded Images (just uploaded) */}
      {uploadedImages.length > 0 && (
        <div className="p-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg">
          {uploadedImages.length} image(s) téléchargée(s) avec succès
        </div>
      )}
    </div>
  );
}
