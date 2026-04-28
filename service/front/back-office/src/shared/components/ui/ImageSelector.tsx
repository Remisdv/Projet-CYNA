import { useState } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface ImageSelectorProps {
  existingImages?: Array<{ url: string; altText?: string }>;
  onImagesChange: (files: File[]) => void;
  onRemoveExisting?: (index: number) => void;
  maxFiles?: number;
}

export function ImageSelector({
  existingImages = [],
  onImagesChange,
  onRemoveExisting,
  maxFiles = 10,
}: ImageSelectorProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const totalImages = existingImages.length + selectedFiles.length + files.length;
    if (totalImages > maxFiles) {
      alert(`Vous ne pouvez sélectionner que ${maxFiles} images maximum`);
      return;
    }

    const newFiles = Array.from(files);
    const newPreviews = newFiles.map(file => URL.createObjectURL(file));

    setSelectedFiles(prev => {
      const updated = [...prev, ...newFiles];
      onImagesChange(updated);
      return updated;
    });

    setPreviews(prev => [...prev, ...newPreviews]);
  };

  const removeFile = (index: number) => {
    URL.revokeObjectURL(previews[index]);

    setSelectedFiles(prev => {
      const updated = prev.filter((_, i) => i !== index);
      onImagesChange(updated);
      return updated;
    });

    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      {/* File Input */}
      <label className="block">
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
        />
      </label>

      {/* Selected Files Preview */}
      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">
            Nouvelles images sélectionnées ({selectedFiles.length})
          </h4>
          <div className="grid grid-cols-4 gap-3">
            {selectedFiles.map((file, idx) => (
              <div key={idx} className="relative group">
                <img
                  src={previews[idx]}
                  alt={file.name}
                  className="w-full h-24 object-cover rounded-lg border border-gray-200"
                />
                <button
                  type="button"
                  onClick={() => removeFile(idx)}
                  className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="absolute bottom-1 left-1 right-1 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded truncate">
                  {file.name}
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
    </div>
  );
}
