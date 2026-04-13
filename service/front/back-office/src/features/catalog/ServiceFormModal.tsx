import { useState, useEffect, useCallback } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import {
  FileText,
  DollarSign,
  Package,
  Image as ImageIcon,
  Search,
  Upload,
  X,
  GripVertical,
  Star,
  Info,
} from 'lucide-react';
import { useCreateService, useUpdateService } from './hooks/useServices';

// ========== TYPES ==========

interface ServiceImage {
  id: string;
  url: string;
  altText: string;
  isPrimary: boolean;
}

interface ServiceFormData {
  // Général
  name: string;
  shortDescription: string;
  longDescription: string;
  category: string;
  type: 'product' | 'service';
  tags: string[];

  // Tarification
  price: number;
  monthlyPrice: number;
  annualPrice: number;

  // Stock
  stockQuantity: number | 'unlimited';
  lowStockThreshold: number;

  // Images
  images: ServiceImage[];

  // SEO
  slug: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string;

  // Status
  status: 'draft' | 'published';
}

interface ServiceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: any | null;
}

type TabId = 'general' | 'pricing' | 'stock' | 'images' | 'seo';

interface Tab {
  id: TabId;
  label: string;
  icon: React.ReactNode;
}

const tabs: Tab[] = [
  { id: 'general', label: 'Général', icon: <FileText className="h-4 w-4" /> },
  { id: 'pricing', label: 'Tarification', icon: <DollarSign className="h-4 w-4" /> },
  { id: 'stock', label: 'Stock', icon: <Package className="h-4 w-4" /> },
  { id: 'images', label: 'Images', icon: <ImageIcon className="h-4 w-4" /> },
  { id: 'seo', label: 'SEO', icon: <Search className="h-4 w-4" /> },
];

const categories = [
  { value: '', label: 'Sélectionner une catégorie' },
  { value: 'SOC', label: 'SOC' },
  { value: 'EDR', label: 'EDR' },
  { value: 'XDR', label: 'XDR' },
  { value: 'Service', label: 'Service' },
];

const availableTags = [
  'cybersecurity', 'protection', 'monitoring', 'detection', 'response',
  'cloud', 'enterprise', 'sme', 'managed', 'consulting',
];

// ========== COMPONENT ==========

export default function ServiceFormModal({
  isOpen,
  onClose,
  service,
}: ServiceFormModalProps) {
  const createService = useCreateService();
  const updateService = useUpdateService();
  const [activeTab, setActiveTab] = useState<TabId>('general');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState<ServiceFormData>({
    name: '',
    shortDescription: '',
    longDescription: '',
    category: '',
    type: 'product',
    tags: [],
    price: 0,
    monthlyPrice: 0,
    annualPrice: 0,
    stockQuantity: 0,
    lowStockThreshold: 10,
    images: [],
    slug: '',
    metaTitle: '',
    metaDescription: '',
    keywords: '',
    status: 'draft',
  });

  // Form errors
  const [errors, setErrors] = useState<Partial<Record<keyof ServiceFormData, string>>>({});

  // Reset form when modal opens/closes or service changes
  useEffect(() => {
    if (isOpen) {
      if (service) {
        setFormData({
          name: service.name || '',
          shortDescription: service.shortDescription || '',
          longDescription: service.description || '',
          category: service.category || '',
          type: service.type || 'product',
          tags: service.tags || [],
          price: service.price || 0,
          monthlyPrice: service.monthlyPrice || 0,
          annualPrice: service.annualPrice || 0,
          stockQuantity: service.stock === 'unlimited' ? 'unlimited' : (service.stock || 0),
          lowStockThreshold: service.lowStockThreshold || 10,
          images: service.images?.map((img: any, idx: number) => ({
            id: `img-${idx}`,
            url: img.url,
            altText: img.altText || '',
            isPrimary: img.isPrimary || idx === 0,
          })) || [],
          slug: service.slug || '',
          metaTitle: service.metaTitle || '',
          metaDescription: service.metaDescription || '',
          keywords: service.keywords || '',
          status: service.status || 'draft',
        });
      } else {
        setFormData({
          name: '',
          shortDescription: '',
          longDescription: '',
          category: '',
          type: 'product',
          tags: [],
          price: 0,
          monthlyPrice: 0,
          annualPrice: 0,
          stockQuantity: 0,
          lowStockThreshold: 10,
          images: [],
          slug: '',
          metaTitle: '',
          metaDescription: '',
          keywords: '',
          status: 'draft',
        });
      }
      setActiveTab('general');
      setErrors({});
    }
  }, [isOpen, service]);

  // Auto-generate slug from name
  const generateSlug = useCallback((name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }, []);

  // Calculate annual discount
  const annualDiscount = formData.monthlyPrice > 0
    ? Math.round((1 - formData.annualPrice / (formData.monthlyPrice * 12)) * 100)
    : 0;

  // Update form field
  const updateField = <K extends keyof ServiceFormData>(
    field: K,
    value: ServiceFormData[K]
  ) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };

      // Auto-update slug when name changes
      if (field === 'name' && typeof value === 'string') {
        updated.slug = generateSlug(value);
        updated.metaTitle = `${value} | Cyna Security`;
      }

      // Auto-calculate annual price when monthly price changes
      if (field === 'monthlyPrice' && typeof value === 'number') {
        updated.annualPrice = Math.round(value * 12 * 0.85);
      }

      return updated;
    });
    setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  // Toggle tag
  const toggleTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag],
    }));
  };

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages: ServiceImage[] = Array.from(files).map((file, idx) => ({
      id: `new-${Date.now()}-${idx}`,
      url: URL.createObjectURL(file),
      altText: file.name.replace(/\.[^/.]+$/, ''),
      isPrimary: formData.images.length === 0 && idx === 0,
    }));

    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...newImages],
    }));
  };

  // Remove image
  const removeImage = (imageId: string) => {
    setFormData(prev => {
      const updated = prev.images.filter(img => img.id !== imageId);
      // If we removed the primary image, make the first one primary
      if (updated.length > 0 && !updated.some(img => img.isPrimary)) {
        updated[0].isPrimary = true;
      }
      return { ...prev, images: updated };
    });
  };

  // Set primary image
  const setPrimaryImage = (imageId: string) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.map(img => ({
        ...img,
        isPrimary: img.id === imageId,
      })),
    }));
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ServiceFormData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Le nom est requis';
    }
    if (!formData.category) {
      newErrors.category = 'La catégorie est requise';
    }
    if (formData.type === 'product' && formData.price <= 0) {
      newErrors.price = 'Le prix est requis';
    }
    if (formData.type === 'service') {
      if (formData.monthlyPrice <= 0) {
        newErrors.monthlyPrice = 'Le prix mensuel est requis';
      }
      if (formData.annualPrice <= 0) {
        newErrors.annualPrice = 'Le prix annuel est requis';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle save
  const handleSave = async (publish: boolean = false) => {
    if (!validateForm()) {
      // Switch to the tab with the first error
      if (errors.name || errors.category) {
        setActiveTab('general');
      } else if (errors.price || errors.monthlyPrice || errors.annualPrice) {
        setActiveTab('pricing');
      }
      return;
    }

    setIsSubmitting(true);

    try {
      const payload: Record<string, any> = {
        name: formData.name,
        shortDescription: formData.shortDescription,
        longDescription: formData.longDescription,
        category: formData.category,
        type: formData.type === 'product' ? 'produit' : 'service',
        tags: formData.tags,
        price: formData.type === 'product' ? formData.price : undefined,
        monthlyPrice: formData.type === 'service' ? formData.monthlyPrice : undefined,
        annualPrice: formData.type === 'service' ? formData.annualPrice : undefined,
        stock: formData.type === 'product' && formData.stockQuantity !== 'unlimited' ? formData.stockQuantity : undefined,
        unlimitedStock: formData.type === 'service' || formData.stockQuantity === 'unlimited' ? true : undefined,
        lowStockThreshold: formData.lowStockThreshold,
        slug: formData.slug,
        metaTitle: formData.metaTitle,
        metaDescription: formData.metaDescription,
        keywords: formData.keywords,
        status: publish ? 'published' : formData.status,
      };

      if (service?.id) {
        await updateService.mutateAsync({ id: service.id, ...payload });
      } else {
        await createService.mutateAsync(payload);
      }

      onClose();
    } catch (error) {
      console.error('Error saving service:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={service ? 'Modifier le Service' : 'Nouveau Service'}
      size="full"
      footer={
        <div className="flex items-center justify-between w-full">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Annuler
          </Button>
          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              onClick={() => handleSave(false)}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Enregistrement...' : 'Enregistrer (Brouillon)'}
            </Button>
            <Button
              onClick={() => handleSave(true)}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Publication...' : 'Publier'}
            </Button>
          </div>
        </div>
      }
    >
      <div className="flex flex-col h-full">
        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-6">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Général Tab */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <Input
                label="Nom *"
                value={formData.name}
                onChange={e => updateField('name', e.target.value)}
                error={errors.name}
                placeholder="Nom du service/produit"
              />

              <div>
                <Textarea
                  label={`Description courte (${formData.shortDescription.length}/100 caractères)`}
                  value={formData.shortDescription}
                  onChange={e => updateField('shortDescription', e.target.value.slice(0, 100))}
                  placeholder="Brève description du service"
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description longue (Markdown supporté)
                </label>
                <Textarea
                  value={formData.longDescription}
                  onChange={e => updateField('longDescription', e.target.value)}
                  placeholder="Description détaillée du service. Vous pouvez utiliser **gras**, *italique*, - listes, etc."
                  rows={6}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Supporte la syntaxe Markdown: **gras**, *italique*, # titres, - listes
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Catégorie *"
                  value={formData.category}
                  onChange={e => updateField('category', e.target.value)}
                  error={errors.category}
                  options={categories}
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <div className="flex gap-2">
                    {(['product', 'service'] as const).map(type => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => updateField('type', type)}
                        className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          formData.type === type
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {type === 'product' ? 'Produit' : 'Service'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableTags.map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                        formData.tags.includes(tag)
                          ? 'bg-blue-100 text-blue-800 border border-blue-300'
                          : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tarification Tab */}
          {activeTab === 'pricing' && (
            <div className="space-y-6">
              {formData.type === 'product' ? (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Prix unique</h3>
                  <Input
                    label="Prix (€) *"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={e => updateField('price', parseFloat(e.target.value) || 0)}
                    error={errors.price}
                    placeholder="99.99"
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    TTL/Période : N/A (achat unique)
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Tarification Abonnement</h3>

                  <div className="grid grid-cols-2 gap-6">
                    <Input
                      label="Prix mensuel (€) *"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.monthlyPrice}
                      onChange={e => updateField('monthlyPrice', parseFloat(e.target.value) || 0)}
                      error={errors.monthlyPrice}
                      placeholder="49.99"
                    />

                    <Input
                      label="Prix annuel (€) *"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.annualPrice}
                      onChange={e => updateField('annualPrice', parseFloat(e.target.value) || 0)}
                      error={errors.annualPrice}
                      placeholder="509.99"
                    />
                  </div>

                  {formData.monthlyPrice > 0 && formData.annualPrice > 0 && (
                    <div className={`p-4 rounded-lg ${annualDiscount > 0 ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'}`}>
                      <div className="flex items-center gap-2">
                        <Info className="h-5 w-5 text-green-600" />
                        <span className="text-sm font-medium text-green-800">
                          {annualDiscount > 0
                            ? `Économisez ${annualDiscount}% en prenant l'abonnement annuel`
                            : 'Configurez le prix annuel pour offrir une remise'}
                        </span>
                      </div>
                      {annualDiscount > 0 && (
                        <p className="mt-2 text-xs text-green-600">
                          Prix mensuel x 12 = {(formData.monthlyPrice * 12).toFixed(2)}€ → Prix annuel = {formData.annualPrice.toFixed(2)}€
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Stock Tab */}
          {activeTab === 'stock' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantité disponible
                </label>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => updateField('stockQuantity', 'unlimited')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      formData.stockQuantity === 'unlimited'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Illimité
                  </button>
                  <span className="text-gray-400">ou</span>
                  <div className="flex-1">
                    <Input
                      type="number"
                      min="0"
                      value={formData.stockQuantity === 'unlimited' ? '' : formData.stockQuantity}
                      onChange={e => updateField('stockQuantity', parseInt(e.target.value) || 0)}
                      placeholder="Quantité"
                      disabled={formData.stockQuantity === 'unlimited'}
                    />
                  </div>
                </div>
              </div>

              <Input
                label="Seuil d'alerte niveau bas"
                type="number"
                min="0"
                value={formData.lowStockThreshold}
                onChange={e => updateField('lowStockThreshold', parseInt(e.target.value) || 0)}
                placeholder="10"
              />
              <p className="text-sm text-gray-500">
                Une alerte sera affichée lorsque le stock atteint ce seuil.
              </p>
            </div>
          )}

          {/* Images Tab */}
          {activeTab === 'images' && (
            <div className="space-y-6">
              {/* Upload Zone */}
              <label className="block">
                <div className="flex items-center justify-center w-full h-40 px-4 transition bg-white border-2 border-gray-300 border-dashed rounded-lg appearance-none cursor-pointer hover:border-blue-400 focus:outline-none">
                  <div className="flex flex-col items-center space-y-2">
                    <Upload className="w-10 h-10 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      Glissez-déposez vos images ici ou cliquez pour sélectionner
                    </span>
                    <span className="text-xs text-gray-500">
                      PNG, JPG, GIF, WEBP (max 10 images)
                    </span>
                  </div>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                />
              </label>

              {/* Images Grid */}
              {formData.images.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">
                    Images ({formData.images.length})
                  </h4>
                  <p className="text-xs text-gray-500 mb-3">
                    Cliquez sur l'étoile pour définir l'image principale. Glissez pour réordonner.
                  </p>
                  <div className="grid grid-cols-4 gap-4">
                    {formData.images.map((image, idx) => (
                      <div
                        key={image.id}
                        className={`relative group rounded-lg overflow-hidden border-2 ${
                          image.isPrimary ? 'border-blue-500' : 'border-gray-200'
                        }`}
                      >
                        <img
                          src={image.url}
                          alt={image.altText}
                          className="w-full h-32 object-cover"
                        />

                        {/* Overlay */}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => setPrimaryImage(image.id)}
                            className={`p-2 rounded-full ${
                              image.isPrimary
                                ? 'bg-yellow-500 text-white'
                                : 'bg-white text-gray-700 hover:bg-yellow-100'
                            }`}
                            title="Définir comme image principale"
                          >
                            <Star className={`h-4 w-4 ${image.isPrimary ? 'fill-current' : ''}`} />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeImage(image.id)}
                            className="p-2 bg-white text-red-600 rounded-full hover:bg-red-100"
                            title="Supprimer"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>

                        {/* Drag Handle */}
                        <div className="absolute top-2 left-2 p-1 bg-white/80 rounded cursor-move opacity-0 group-hover:opacity-100 transition-opacity">
                          <GripVertical className="h-4 w-4 text-gray-500" />
                        </div>

                        {/* Primary Badge */}
                        {image.isPrimary && (
                          <div className="absolute top-2 right-2">
                            <Badge variant="default" className="text-xs">
                              Principale
                            </Badge>
                          </div>
                        )}

                        {/* Alt Text */}
                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-2 truncate">
                          {image.altText || `Image ${idx + 1}`}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {formData.images.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <ImageIcon className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>Aucune image ajoutée</p>
                  <p className="text-sm">Ajoutez des images pour présenter votre service</p>
                </div>
              )}
            </div>
          )}

          {/* SEO Tab */}
          {activeTab === 'seo' && (
            <div className="space-y-6">
              <div>
                <Input
                  label="Slug URL"
                  value={formData.slug}
                  onChange={e => updateField('slug', e.target.value)}
                  placeholder="mon-service"
                />
                <p className="mt-1 text-xs text-gray-500">
                  L'URL sera: /services/{formData.slug || 'mon-service'}
                </p>
              </div>

              <div>
                <Input
                  label={`Meta Title (${formData.metaTitle.length}/60 caractères)`}
                  value={formData.metaTitle}
                  onChange={e => updateField('metaTitle', e.target.value.slice(0, 60))}
                  placeholder="Titre pour les moteurs de recherche"
                />
                {formData.metaTitle.length > 60 && (
                  <p className="mt-1 text-xs text-orange-600">
                    Le titre dépasse la longueur recommandée de 60 caractères
                  </p>
                )}
              </div>

              <div>
                <Textarea
                  label={`Meta Description (${formData.metaDescription.length}/160 caractères)`}
                  value={formData.metaDescription}
                  onChange={e => updateField('metaDescription', e.target.value.slice(0, 160))}
                  placeholder="Description pour les moteurs de recherche"
                  rows={3}
                />
                {formData.metaDescription.length > 160 && (
                  <p className="mt-1 text-xs text-orange-600">
                    La description dépasse la longueur recommandée de 160 caractères
                  </p>
                )}
              </div>

              <div>
                <Input
                  label="Keywords (séparés par des virgules)"
                  value={formData.keywords}
                  onChange={e => updateField('keywords', e.target.value)}
                  placeholder="cybersecurity, protection, monitoring"
                />
                {formData.keywords && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {formData.keywords.split(',').map((keyword, idx) => (
                      keyword.trim() && (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {keyword.trim()}
                        </Badge>
                      )
                    ))}
                  </div>
                )}
              </div>

              {/* SEO Preview */}
              <div className="border rounded-lg p-4 bg-gray-50">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Aperçu Google</h4>
                <div className="space-y-1">
                  <p className="text-blue-700 text-lg hover:underline cursor-pointer">
                    {formData.metaTitle || 'Titre de la page'}
                  </p>
                  <p className="text-green-700 text-sm">
                    https://cyna.com/services/{formData.slug || 'mon-service'}
                  </p>
                  <p className="text-gray-600 text-sm">
                    {formData.metaDescription || 'Description de la page qui apparaîtra dans les résultats de recherche...'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
