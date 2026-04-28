import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  FileText, DollarSign, Package, Image as ImageIcon, Search,
} from 'lucide-react';
import { useServiceCategories, useServices } from '../hooks/useServices';
import {
  defaultFormData,
  type ServiceFormData,
  type TabDescriptor,
  type RawValuesState,
} from '../types/serviceForm.types';
import { saveDraft, clearDraft } from '../lib/serviceFormDraft';
import { useServiceFormInit } from '../hooks/useServiceForm';
import { useServiceFormHandlers } from '../hooks/useServiceFormHandlers';
import { ServiceFormGeneralTab } from '../components/serviceForm/ServiceFormGeneralTab';
import { ServiceFormPricingTab } from '../components/serviceForm/ServiceFormPricingTab';
import { ServiceFormStockTab } from '../components/serviceForm/ServiceFormStockTab';
import { ServiceFormImagesTab } from '../components/serviceForm/ServiceFormImagesTab';
import { ServiceFormSeoTab } from '../components/serviceForm/ServiceFormSeoTab';
import { ServiceFormPreview } from '../components/serviceForm/ServiceFormPreview';
import { ServiceFormHeader } from '../components/serviceForm/ServiceFormHeader';

const tabs: TabDescriptor[] = [
  { id: 'general', label: 'Général', icon: <FileText className="h-4 w-4" /> },
  { id: 'pricing', label: 'Tarification', icon: <DollarSign className="h-4 w-4" /> },
  { id: 'stock', label: 'Stock', icon: <Package className="h-4 w-4" /> },
  { id: 'images', label: 'Images', icon: <ImageIcon className="h-4 w-4" /> },
  { id: 'seo', label: 'SEO', icon: <Search className="h-4 w-4" /> },
];

export default function ServiceFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const isCreate = !id;

  const { data: services = [] } = useServices();
  const service = id ? services.find(s => s.id === id) ?? null : null;

  const { data: rawCategories } = useServiceCategories();
  const categories = rawCategories?.map(c =>
    c.value === '' ? { ...c, label: 'Sélectionner une catégorie' } : c
  ) ?? [{ value: '', label: 'Sélectionner une catégorie' }];

  const {
    initialized, hasDraft, setHasDraft,
    formData, setFormData,
    rawValues, setRawValues,
    activeTab, setActiveTab,
  } = useServiceFormInit({ service, isCreate });

  const setRaw = (field: keyof RawValuesState, value: string) =>
    setRawValues(prev => ({ ...prev, [field]: value }));

  const {
    isSubmitting, errors, setErrors,
    imageUrlInput, setImageUrlInput,
    isUploading, fileInputRef,
    addImageUrl, handleFileUpload, removeImage, setPrimaryImage,
    handleSave,
  } = useServiceFormHandlers({ service, formData, setFormData, setActiveTab });

  // Draft auto-save (create mode only)
  const draftTimer = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => {
    if (!isCreate || !initialized) return;
    clearTimeout(draftTimer.current);
    draftTimer.current = setTimeout(() => {
      if (formData.name || formData.shortDescription || formData.category) {
        saveDraft(formData, activeTab);
      }
    }, 500);
    return () => clearTimeout(draftTimer.current);
  }, [formData, activeTab, isCreate, initialized]);

  const generateSlug = useCallback((name: string) =>
    name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''), []);

  const annualDiscount = formData.monthlyPrice > 0
    ? Math.round((1 - formData.annualPrice / (formData.monthlyPrice * 12)) * 100) : 0;

  const updateField = <K extends keyof ServiceFormData>(field: K, value: ServiceFormData[K]) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      if (field === 'name' && typeof value === 'string') {
        updated.slug = generateSlug(value);
        updated.metaTitle = `${value} | Cyna Security`;
      }
      if (field === 'monthlyPrice' && typeof value === 'number') {
        updated.annualPrice = Math.round(value * 12 * 0.85);
        setRaw('annualPrice', String(Math.round(value * 12 * 0.85)));
      }
      return updated;
    });
    setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const toggleTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag) ? prev.tags.filter(t => t !== tag) : [...prev.tags, tag],
    }));
  };

  const [previewPeriod, setPreviewPeriod] = useState<'mensuel' | 'annuel'>('mensuel');
  const [previewImgIdx, setPreviewImgIdx] = useState(0);
  useEffect(() => { setPreviewImgIdx(0); }, [formData.images.length]);

  if (!isCreate && !initialized) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center text-gray-500">
          <Package className="h-10 w-10 mx-auto mb-3 animate-pulse text-gray-300" />
          <p>Chargement du service...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      <ServiceFormHeader
        isCreate={isCreate}
        serviceName={service?.name}
        serviceStatus={service?.status}
        isSubmitting={isSubmitting}
        onCancel={() => navigate('/catalog/services')}
        onSaveDraft={() => handleSave(false)}
        onPublish={() => handleSave(true)}
      />

      <div className="flex flex-1 overflow-hidden">
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden border-r">
          {hasDraft && isCreate && (
            <div className="shrink-0 flex items-center justify-between bg-amber-50 border-b border-amber-200 px-6 py-2 text-sm">
              <span className="text-amber-800">Brouillon restauré automatiquement.</span>
              <button
                onClick={() => { clearDraft(); setFormData({ ...defaultFormData }); setActiveTab('general'); setHasDraft(false); }}
                className="text-amber-700 underline hover:text-amber-900 text-sm"
              >
                Supprimer le brouillon
              </button>
            </div>
          )}

          <div className="shrink-0 flex border-b border-gray-200 bg-white px-6">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3.5 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-800'
                  }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-6">
            <div className="max-w-2xl space-y-6">
              {activeTab === 'general' && (
                <ServiceFormGeneralTab
                  formData={formData}
                  errors={errors}
                  categories={categories}
                  updateField={updateField}
                  toggleTag={toggleTag}
                />
              )}
              {activeTab === 'pricing' && (
                <ServiceFormPricingTab
                  formData={formData}
                  errors={errors}
                  rawValues={rawValues}
                  setRaw={setRaw}
                  updateField={updateField}
                  annualDiscount={annualDiscount}
                />
              )}
              {activeTab === 'stock' && (
                <ServiceFormStockTab
                  formData={formData}
                  rawValues={rawValues}
                  setRaw={setRaw}
                  updateField={updateField}
                />
              )}
              {activeTab === 'images' && (
                <ServiceFormImagesTab
                  formData={formData}
                  imageUrlInput={imageUrlInput}
                  setImageUrlInput={setImageUrlInput}
                  isUploading={isUploading}
                  fileInputRef={fileInputRef}
                  handleFileUpload={handleFileUpload}
                  addImageUrl={addImageUrl}
                  removeImage={removeImage}
                  setPrimaryImage={setPrimaryImage}
                />
              )}
              {activeTab === 'seo' && (
                <ServiceFormSeoTab formData={formData} updateField={updateField} />
              )}
            </div>
          </div>
        </div>

        <ServiceFormPreview
          formData={formData}
          previewPeriod={previewPeriod}
          setPreviewPeriod={setPreviewPeriod}
          previewImgIdx={previewImgIdx}
          setPreviewImgIdx={setPreviewImgIdx}
          annualDiscount={annualDiscount}
        />
      </div>
    </div>
  );
}
