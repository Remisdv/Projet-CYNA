// import { useState, useEffect, useCallback, useRef } from 'react';
// import { Modal } from '../../components/ui/Modal';
// import { Input } from '../../components/ui/Input';
// import { Textarea } from '../../components/ui/Textarea';
// import { Select } from '../../components/ui/Select';
// import { Button } from '../../components/ui/Button';
// import { Badge } from '../../components/ui/Badge';
// import {
//   FileText,
//   DollarSign,
//   Package,
//   Image as ImageIcon,
//   Search,
//   X,
//   Star,
//   Info,
//   ShoppingCart,
//   ChevronLeft,
//   ChevronRight,
//   Plus,
//   Upload,
// } from 'lucide-react';
// import {
//   useCreateService,
//   useUpdateService,
//   useAddServiceImages,
//   useDeleteServiceImage,
//   useUploadImages,
//   useServiceCategories,
// } from './hooks/useServices';

// const DRAFT_KEY = 'cyna-bo-service-draft';

// // ========== TYPES ==========

// interface ServiceImage {
//   id: string;
//   url: string;
//   altText: string;
//   isPrimary: boolean;
//   isNew?: boolean;
// }

// interface ServiceFormData {
//   name: string;
//   shortDescription: string;
//   longDescription: string;
//   category: string;
//   type: 'product' | 'service';
//   tags: string[];
//   price: number;
//   monthlyPrice: number;
//   annualPrice: number;
//   stockQuantity: number | 'unlimited';
//   lowStockThreshold: number;
//   images: ServiceImage[];
//   slug: string;
//   metaTitle: string;
//   metaDescription: string;
//   keywords: string;
//   status: 'draft' | 'published';
// }

// interface ServiceFormModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   service: any | null;
// }

// type TabId = 'general' | 'pricing' | 'stock' | 'images' | 'seo';

// const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
//   { id: 'general', label: 'Général', icon: <FileText className="h-4 w-4" /> },
//   { id: 'pricing', label: 'Tarification', icon: <DollarSign className="h-4 w-4" /> },
//   { id: 'stock', label: 'Stock', icon: <Package className="h-4 w-4" /> },
//   { id: 'images', label: 'Images', icon: <ImageIcon className="h-4 w-4" /> },
//   { id: 'seo', label: 'SEO', icon: <Search className="h-4 w-4" /> },
// ];



// const availableTags = [
//   'cybersecurity', 'protection', 'monitoring', 'detection', 'response',
//   'cloud', 'enterprise', 'sme', 'managed', 'consulting',
// ];

// const defaultFormData: ServiceFormData = {
//   name: '',
//   shortDescription: '',
//   longDescription: '',
//   category: '',
//   type: 'product',
//   tags: [],
//   price: 0,
//   monthlyPrice: 0,
//   annualPrice: 0,
//   stockQuantity: 0,
//   lowStockThreshold: 10,
//   images: [],
//   slug: '',
//   metaTitle: '',
//   metaDescription: '',
//   keywords: '',
//   status: 'draft',
// };

// // ========== DRAFT HELPERS ==========

// function saveDraft(data: ServiceFormData, tab: TabId) {
//   try {
//     const safeData = {
//       ...data,
//       images: data.images.filter(img => !img.url.startsWith('blob:')),
//     };
//     sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ data: safeData, tab, ts: Date.now() }));
//   } catch { /* ignore */ }
// }

// function loadDraft(): { data: ServiceFormData; tab: TabId } | null {
//   try {
//     const raw = sessionStorage.getItem(DRAFT_KEY);
//     if (!raw) return null;
//     const parsed = JSON.parse(raw);
//     if (Date.now() - parsed.ts > 4 * 60 * 60 * 1000) {
//       sessionStorage.removeItem(DRAFT_KEY);
//       return null;
//     }
//     return { data: parsed.data, tab: parsed.tab || 'general' };
//   } catch { return null; }
// }

// function clearDraft() {
//   sessionStorage.removeItem(DRAFT_KEY);
// }

// // ========== COMPONENT ==========

// export default function ServiceFormModal({ isOpen, onClose, service }: ServiceFormModalProps) {
//   const createService = useCreateService();
//   const updateService = useUpdateService();
//   const addImages = useAddServiceImages();
//   const deleteImage = useDeleteServiceImage();
//   const uploadImages = useUploadImages();
//   const { data: rawCategories } = useServiceCategories();
//   const categories = rawCategories?.map(c =>
//     c.value === '' ? { ...c, label: 'Sélectionner une catégorie' } : c
//   ) ?? [{ value: '', label: 'Sélectionner une catégorie' }];

//   const [activeTab, setActiveTab] = useState<TabId>('general');
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [hasDraft, setHasDraft] = useState(false);
//   const [formData, setFormData] = useState<ServiceFormData>({ ...defaultFormData });
//   const [errors, setErrors] = useState<Partial<Record<keyof ServiceFormData, string>>>({});
//   const [imageUrlInput, setImageUrlInput] = useState('');
//   const [isUploading, setIsUploading] = useState(false);
//   const fileInputRef = useRef<HTMLInputElement>(null);

//   // String representations for numeric fields so the user can clear them freely
//   const [rawValues, setRawValues] = useState({
//     price: '0',
//     monthlyPrice: '0',
//     annualPrice: '0',
//     stockQuantity: '0',
//     lowStockThreshold: '10',
//   });
//   const setRaw = (field: keyof typeof rawValues, value: string) =>
//     setRawValues(prev => ({ ...prev, [field]: value }));

//   const isCreate = !service;

//   // Draft auto-save (create mode only)
//   const draftTimer = useRef<ReturnType<typeof setTimeout>>();
//   useEffect(() => {
//     if (!isOpen || !isCreate) return;
//     clearTimeout(draftTimer.current);
//     draftTimer.current = setTimeout(() => {
//       if (formData.name || formData.shortDescription || formData.longDescription || formData.category) {
//         saveDraft(formData, activeTab);
//       }
//     }, 500);
//     return () => clearTimeout(draftTimer.current);
//   }, [formData, activeTab, isOpen, isCreate]);

//   // Load form data on open
//   useEffect(() => {
//     if (!isOpen) return;
//     if (service) {
//       setFormData({
//         name: service.name || '',
//         shortDescription: service.shortDescription || '',
//         longDescription: service.longDescription || '',
//         category: service.category || '',
//         type: service.type || 'product',
//         tags: service.tags || [],
//         price: Number(service.price) || 0,
//         monthlyPrice: Number(service.monthlyPrice) || 0,
//         annualPrice: Number(service.annualPrice) || 0,
//         stockQuantity: service.stock === 'unlimited' ? 'unlimited' : (Number(service.stock) || 0),
//         lowStockThreshold: Number(service.lowStockThreshold) || 10,
//         images: (service.images || []).map((img: any, idx: number) => ({
//           id: img.id || `existing-${idx}`,
//           url: img.url || '',
//           altText: img.altText || '',
//           isPrimary: img.isPrimary || false,
//           isNew: false,
//         })),
//         slug: service.slug || '',
//         metaTitle: service.metaTitle || '',
//         metaDescription: service.metaDescription || '',
//         keywords: service.keywords || '',
//         status: service.status || 'draft',
//       });
//       setHasDraft(false);
//       setRawValues({
//         price: String(Number(service.price) || 0),
//         monthlyPrice: String(Number(service.monthlyPrice) || 0),
//         annualPrice: String(Number(service.annualPrice) || 0),
//         stockQuantity: service.stock === 'unlimited' ? '0' : String(Number(service.stock) || 0),
//         lowStockThreshold: String(Number(service.lowStockThreshold) || 10),
//       });
//     } else {
//       const draft = loadDraft();
//       if (draft) {
//         setFormData(draft.data);
//         setActiveTab(draft.tab);
//         setHasDraft(true);
//         setRawValues({
//           price: String(draft.data.price ?? 0),
//           monthlyPrice: String(draft.data.monthlyPrice ?? 0),
//           annualPrice: String(draft.data.annualPrice ?? 0),
//           stockQuantity: draft.data.stockQuantity === 'unlimited' ? '0' : String(draft.data.stockQuantity ?? 0),
//           lowStockThreshold: String(draft.data.lowStockThreshold ?? 10),
//         });
//       } else {
//         setFormData({ ...defaultFormData });
//         setHasDraft(false);
//         setRawValues({ price: '0', monthlyPrice: '0', annualPrice: '0', stockQuantity: '0', lowStockThreshold: '10' });
//       }
//     }
//     setActiveTab(prev => service ? 'general' : prev);
//     setErrors({});
//     setImageUrlInput('');
//   }, [isOpen, service]);

//   // Helpers
//   const generateSlug = useCallback((name: string) => {
//     return name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
//       .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
//   }, []);

//   const annualDiscount = formData.monthlyPrice > 0
//     ? Math.round((1 - formData.annualPrice / (formData.monthlyPrice * 12)) * 100) : 0;

//   const updateField = <K extends keyof ServiceFormData>(field: K, value: ServiceFormData[K]) => {
//     setFormData(prev => {
//       const updated = { ...prev, [field]: value };
//       if (field === 'name' && typeof value === 'string') {
//         updated.slug = generateSlug(value);
//         updated.metaTitle = `${value} | Cyna Security`;
//       }
//       if (field === 'monthlyPrice' && typeof value === 'number') {
//         updated.annualPrice = Math.round(value * 12 * 0.85);
//       }
//       return updated;
//     });
//     setErrors(prev => ({ ...prev, [field]: undefined }));
//   };

//   const toggleTag = (tag: string) => {
//     setFormData(prev => ({
//       ...prev,
//       tags: prev.tags.includes(tag) ? prev.tags.filter(t => t !== tag) : [...prev.tags, tag],
//     }));
//   };

//   // Image management
//   const addImageUrl = () => {
//     const url = imageUrlInput.trim();
//     if (!url) return;
//     try { new URL(url); } catch { return; }
//     setFormData(prev => ({
//       ...prev,
//       images: [...prev.images, {
//         id: `new-${Date.now()}`,
//         url,
//         altText: '',
//         isPrimary: prev.images.length === 0,
//         isNew: true,
//       }],
//     }));
//     setImageUrlInput('');
//   };

//   const handleFileUpload = async (files: FileList | File[]) => {
//     const fileArr = Array.from(files).filter(f => f.type.startsWith('image/'));
//     if (fileArr.length === 0) return;
//     setIsUploading(true);
//     try {
//       const urls = await uploadImages.mutateAsync(fileArr);
//       setFormData(prev => ({
//         ...prev,
//         images: [
//           ...prev.images,
//           ...urls.map((url, idx) => ({
//             id: `new-${Date.now()}-${idx}`,
//             url,
//             altText: fileArr[idx]?.name?.replace(/\.[^/.]+$/, '') || '',
//             isPrimary: prev.images.length === 0 && idx === 0,
//             isNew: true,
//           })),
//         ],
//       }));
//     } catch (err) {
//       console.error('Upload failed:', err);
//     } finally {
//       setIsUploading(false);
//       if (fileInputRef.current) fileInputRef.current.value = '';
//     }
//   };

//   const removeImage = (imageId: string) => {
//     setFormData(prev => {
//       const updated = prev.images.filter(img => img.id !== imageId);
//       if (updated.length > 0 && !updated.some(img => img.isPrimary)) {
//         updated[0].isPrimary = true;
//       }
//       return { ...prev, images: updated };
//     });
//   };

//   const setPrimaryImage = (imageId: string) => {
//     setFormData(prev => ({
//       ...prev,
//       images: prev.images.map(img => ({ ...img, isPrimary: img.id === imageId })),
//     }));
//   };

//   // Validation
//   const validateForm = (): boolean => {
//     const newErrors: Partial<Record<keyof ServiceFormData, string>> = {};
//     if (!formData.name.trim()) newErrors.name = 'Le nom est requis';
//     if (!formData.category) newErrors.category = 'La catégorie est requise';
//     if (formData.type === 'product' && formData.price <= 0) newErrors.price = 'Le prix est requis';
//     if (formData.type === 'service') {
//       if (formData.monthlyPrice <= 0) newErrors.monthlyPrice = 'Le prix mensuel est requis';
//       if (formData.annualPrice <= 0) newErrors.annualPrice = 'Le prix annuel est requis';
//     }
//     setErrors(newErrors);
//     if (Object.keys(newErrors).length > 0) {
//       if (newErrors.name || newErrors.category) setActiveTab('general');
//       else if (newErrors.price || newErrors.monthlyPrice || newErrors.annualPrice) setActiveTab('pricing');
//     }
//     return Object.keys(newErrors).length === 0;
//   };

//   // Save
//   const handleSave = async (publish: boolean = false) => {
//     if (!validateForm()) return;
//     setIsSubmitting(true);

//     try {
//       const payload: Record<string, any> = {
//         name: formData.name,
//         shortDescription: formData.shortDescription,
//         longDescription: formData.longDescription,
//         category: formData.category,
//         type: formData.type === 'product' ? 'produit' : 'service',
//         tags: formData.tags,
//         price: formData.type === 'product' ? formData.price : undefined,
//         monthlyPrice: formData.type === 'service' ? formData.monthlyPrice : undefined,
//         annualPrice: formData.type === 'service' ? formData.annualPrice : undefined,
//         stock: formData.type === 'product' && formData.stockQuantity !== 'unlimited' ? formData.stockQuantity : undefined,
//         unlimitedStock: formData.type === 'service' || formData.stockQuantity === 'unlimited' ? true : undefined,
//         lowStockThreshold: formData.lowStockThreshold,
//         slug: formData.slug,
//         metaTitle: formData.metaTitle,
//         metaDescription: formData.metaDescription,
//         keywords: formData.keywords,
//         status: publish ? 'published' : formData.status,
//       };

//       let savedId = service?.id;

//       if (service?.id) {
//         await updateService.mutateAsync({ id: service.id, ...payload });
//       } else {
//         const result = await createService.mutateAsync(payload);
//         savedId = (result as any)?.id;
//       }

//       // Sync images
//       if (savedId) {
//         // Delete removed images (existing ones no longer in form)
//         if (service?.images) {
//           const currentIds = new Set(formData.images.filter(i => !i.isNew).map(i => i.id));
//           for (const img of service.images) {
//             if (img.id && !currentIds.has(img.id)) {
//               try { await deleteImage.mutateAsync({ serviceId: savedId, imageId: img.id }); } catch { /* ignore */ }
//             }
//           }
//         }

//         // Add new images
//         const newImages = formData.images.filter(i => i.isNew && i.url);
//         if (newImages.length > 0) {
//           try {
//             await addImages.mutateAsync({
//               id: savedId,
//               images: newImages.map(i => ({ url: i.url, est_principale: i.isPrimary })),
//             });
//           } catch { /* ignore */ }
//         }
//       }

//       clearDraft();
//       onClose();
//     } catch (error) {
//       console.error('Error saving service:', error);
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const handleClose = () => { clearDraft(); onClose(); };
//   const handleDiscardDraft = () => { clearDraft(); setFormData({ ...defaultFormData }); setActiveTab('general'); setHasDraft(false); };

//   // Preview state
//   const [previewPeriod, setPreviewPeriod] = useState<'mensuel' | 'annuel'>('mensuel');
//   const [previewImgIdx, setPreviewImgIdx] = useState(0);
//   useEffect(() => { setPreviewImgIdx(0); }, [formData.images.length]);

//   const isService = formData.type === 'service';
//   const previewPrice = isService
//     ? (previewPeriod === 'mensuel' ? formData.monthlyPrice : formData.annualPrice)
//     : formData.price;

//   return (
//     <Modal isOpen={isOpen} onClose={handleClose} title={service ? 'Modifier le Service' : 'Nouveau Service'} size="full"
//       footer={
//         <div className="flex items-center justify-between w-full">
//           <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>Annuler</Button>
//           <div className="flex items-center gap-3">
//             <Button variant="secondary" onClick={() => handleSave(false)} disabled={isSubmitting}>
//               {isSubmitting ? 'Enregistrement...' : 'Enregistrer (Brouillon)'}
//             </Button>
//             <Button onClick={() => handleSave(true)} disabled={isSubmitting}>
//               {isSubmitting ? 'Publication...' : 'Publier'}
//             </Button>
//           </div>
//         </div>
//       }
//     >
//       {/* ===== SIDE-BY-SIDE LAYOUT ===== */}
//       <div className="flex gap-6 h-[calc(90vh-180px)]">

//         {/* LEFT: Form */}
//         <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
//           {hasDraft && isCreate && (
//             <div className="mb-3 flex items-center justify-between rounded-lg bg-amber-50 border border-amber-200 px-4 py-2 text-sm">
//               <span className="text-amber-800">Brouillon restauré.</span>
//               <button onClick={handleDiscardDraft} className="text-amber-700 underline hover:text-amber-900 text-sm">Supprimer</button>
//             </div>
//           )}

//           {/* Tabs */}
//           <div className="flex border-b border-gray-200 mb-4 shrink-0">
//             {tabs.map(tab => (
//               <button key={tab.id} onClick={() => setActiveTab(tab.id)}
//                 className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
//                   activeTab === tab.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
//                 }`}>
//                 {tab.icon}{tab.label}
//               </button>
//             ))}
//           </div>

//           {/* Tab Content */}
//           <div className="flex-1 overflow-y-auto pr-2">
//             {/* General */}
//             {activeTab === 'general' && (
//               <div className="space-y-5">
//                 <Input label="Nom *" value={formData.name} onChange={e => updateField('name', e.target.value)} error={errors.name} placeholder="Nom du service/produit" />
//                 <Textarea label={`Description courte (${formData.shortDescription.length}/100)`} value={formData.shortDescription}
//                   onChange={e => updateField('shortDescription', e.target.value.slice(0, 100))} placeholder="Brève description" rows={2} />
//                 <Textarea label="Description longue (Markdown)" value={formData.longDescription}
//                   onChange={e => updateField('longDescription', e.target.value)} placeholder="Description détaillée..." rows={5} />
//                 <div className="grid grid-cols-2 gap-4">
//                   <Select label="Catégorie *" value={formData.category} onChange={e => updateField('category', e.target.value)} error={errors.category} options={categories} />
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
//                     <div className="flex gap-2">
//                       {(['product', 'service'] as const).map(t => (
//                         <button key={t} type="button" onClick={() => updateField('type', t)}
//                           className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
//                             formData.type === t ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
//                           }`}>{t === 'product' ? 'Produit' : 'Service'}</button>
//                       ))}
//                     </div>
//                   </div>
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
//                   <div className="flex flex-wrap gap-2">
//                     {availableTags.map(tag => (
//                       <button key={tag} type="button" onClick={() => toggleTag(tag)}
//                         className={`px-3 py-1 rounded-full text-sm transition-colors ${
//                           formData.tags.includes(tag) ? 'bg-blue-100 text-blue-800 border border-blue-300' : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
//                         }`}>{tag}</button>
//                     ))}
//                   </div>
//                 </div>
//               </div>
//             )}

//             {/* Pricing */}
//             {activeTab === 'pricing' && (
//               <div className="space-y-6">
//                 {formData.type === 'product' ? (
//                   <div>
//                     <h3 className="text-lg font-medium text-gray-900 mb-4">Prix unique</h3>
//                     <Input label="Prix () *" type="number" step="0.01" min="0" value={rawValues.price}
//                       onChange={e => { setRaw('price', e.target.value); updateField('price', parseFloat(e.target.value) || 0); }}
//                       onBlur={() => setRaw('price', String(formData.price))}
//                       error={errors.price} placeholder="99.99" />
//                   </div>
//                 ) : (
//                   <div className="space-y-6">
//                     <h3 className="text-lg font-medium text-gray-900 mb-4">Tarification Abonnement</h3>
//                     <div className="grid grid-cols-2 gap-6">
//                       <Input label="Prix mensuel () *" type="number" step="0.01" min="0" value={rawValues.monthlyPrice}
//                         onChange={e => { setRaw('monthlyPrice', e.target.value); updateField('monthlyPrice', parseFloat(e.target.value) || 0); }}
//                         onBlur={() => setRaw('monthlyPrice', String(formData.monthlyPrice))}
//                         error={errors.monthlyPrice} placeholder="49.99" />
//                       <Input label="Prix annuel () *" type="number" step="0.01" min="0" value={rawValues.annualPrice}
//                         onChange={e => { setRaw('annualPrice', e.target.value); updateField('annualPrice', parseFloat(e.target.value) || 0); }}
//                         onBlur={() => setRaw('annualPrice', String(formData.annualPrice))}
//                         error={errors.annualPrice} placeholder="509.99" />
//                     </div>
//                     {formData.monthlyPrice > 0 && formData.annualPrice > 0 && annualDiscount > 0 && (
//                       <div className="p-4 rounded-lg bg-green-50 border border-green-200">
//                         <div className="flex items-center gap-2">
//                           <Info className="h-5 w-5 text-green-600" />
//                           <span className="text-sm font-medium text-green-800">Économisez {annualDiscount}% avec l'annuel</span>
//                         </div>
//                         <p className="mt-1 text-xs text-green-600">
//                           {(formData.monthlyPrice * 12).toFixed(2)}/an → {formData.annualPrice.toFixed(2)}/an
//                         </p>
//                       </div>
//                     )}
//                   </div>
//                 )}
//               </div>
//             )}

//             {/* Stock */}
//             {activeTab === 'stock' && (
//               <div className="space-y-6">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Quantité</label>
//                   <div className="flex items-center gap-4">
//                     <button type="button" onClick={() => updateField('stockQuantity', 'unlimited')}
//                       className={`px-4 py-2 rounded-lg text-sm font-medium ${formData.stockQuantity === 'unlimited' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
//                       Illimité
//                     </button>
//                     <span className="text-gray-400">ou</span>
//                     <div className="flex-1">
//                       <Input type="number" min="0" value={formData.stockQuantity === 'unlimited' ? '' : rawValues.stockQuantity}
//                         onChange={e => { setRaw('stockQuantity', e.target.value); updateField('stockQuantity', parseInt(e.target.value) || 0); }}
//                         onBlur={() => { if (formData.stockQuantity !== 'unlimited') setRaw('stockQuantity', String(formData.stockQuantity)); }}
//                         placeholder="Quantité" disabled={formData.stockQuantity === 'unlimited'} />
//                     </div>
//                   </div>
//                 </div>
//                 <Input label="Seuil d'alerte niveau bas" type="number" min="0" value={rawValues.lowStockThreshold}
//                   onChange={e => { setRaw('lowStockThreshold', e.target.value); updateField('lowStockThreshold', parseInt(e.target.value) || 0); }}
//                   onBlur={() => setRaw('lowStockThreshold', String(formData.lowStockThreshold))}
//                   placeholder="10" />
//               </div>
//             )}

//             {/* Images */}
//             {activeTab === 'images' && (
//               <div className="space-y-5">
//                 {/* Upload zone */}
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Upload d'images</label>
//                   <label
//                     className={`flex items-center justify-center w-full h-28 px-4 transition bg-white border-2 border-dashed rounded-lg cursor-pointer ${
//                       isUploading ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
//                     }`}
//                     onDragOver={e => { e.preventDefault(); e.stopPropagation(); }}
//                     onDrop={e => { e.preventDefault(); e.stopPropagation(); if (e.dataTransfer.files.length) handleFileUpload(e.dataTransfer.files); }}
//                   >
//                     <div className="flex flex-col items-center gap-1">
//                       <Upload className={`h-8 w-8 ${isUploading ? 'text-blue-500 animate-pulse' : 'text-gray-400'}`} />
//                       <span className="text-sm text-gray-600">
//                         {isUploading ? 'Upload en cours...' : 'Glissez-déposez ou cliquez pour sélectionner'}
//                       </span>
//                       <span className="text-xs text-gray-400">PNG, JPG, GIF, WEBP (max 5 Mo)</span>
//                     </div>
//                     <input ref={fileInputRef} type="file" className="hidden" accept="image/*" multiple
//                       onChange={e => { if (e.target.files?.length) handleFileUpload(e.target.files); }} />
//                   </label>
//                 </div>

//                 {/* URL input */}
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Ou ajouter par URL</label>
//                   <div className="flex gap-2">
//                     <div className="flex-1">
//                       <Input value={imageUrlInput} onChange={e => setImageUrlInput(e.target.value)}
//                         placeholder="https://example.com/image.jpg"
//                         onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addImageUrl(); } }} />
//                     </div>
//                     <Button onClick={addImageUrl} disabled={!imageUrlInput.trim()}>
//                       <Plus className="h-4 w-4 mr-1" />Ajouter
//                     </Button>
//                   </div>
//                 </div>

//                 {formData.images.length > 0 ? (
//                   <div>
//                     <p className="text-xs text-gray-500 mb-3">Cliquez ★ pour définir l'image principale.</p>
//                     <div className="grid grid-cols-3 gap-3">
//                       {formData.images.map(image => (
//                         <div key={image.id} className={`relative group rounded-lg overflow-hidden border-2 ${image.isPrimary ? 'border-blue-500' : 'border-gray-200'}`}>
//                           <img src={image.url} alt={image.altText} className="w-full h-28 object-cover"
//                             onError={e => { (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="112" fill="%23f3f4f6"><rect width="200" height="112"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%239ca3af" font-size="12">Image invalide</text></svg>'; }} />
//                           <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
//                             <button type="button" onClick={() => setPrimaryImage(image.id)}
//                               className={`p-1.5 rounded-full ${image.isPrimary ? 'bg-yellow-500 text-white' : 'bg-white text-gray-700 hover:bg-yellow-100'}`}>
//                               <Star className={`h-4 w-4 ${image.isPrimary ? 'fill-current' : ''}`} />
//                             </button>
//                             <button type="button" onClick={() => removeImage(image.id)} className="p-1.5 bg-white text-red-600 rounded-full hover:bg-red-100">
//                               <X className="h-4 w-4" />
//                             </button>
//                           </div>
//                           {image.isPrimary && (
//                             <div className="absolute top-1 right-1"><Badge variant="default" className="text-xs">Principale</Badge></div>
//                           )}
//                           {image.isNew && (
//                             <div className="absolute top-1 left-1"><Badge variant="secondary" className="text-xs">Nouvelle</Badge></div>
//                           )}
//                           <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] px-2 py-1 truncate">
//                             {image.url.split('/').pop()?.slice(0, 30)}
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 ) : (
//                   <div className="text-center py-8 text-gray-500">
//                     <ImageIcon className="h-12 w-12 mx-auto mb-3 text-gray-300" />
//                     <p>Aucune image</p>
//                     <p className="text-sm">Ajoutez des URL d'images ci-dessus</p>
//                   </div>
//                 )}
//               </div>
//             )}

//             {/* SEO */}
//             {activeTab === 'seo' && (
//               <div className="space-y-5">
//                 <div>
//                   <Input label="Slug URL" value={formData.slug} onChange={e => updateField('slug', e.target.value)} placeholder="mon-service" />
//                   <p className="mt-1 text-xs text-gray-500">/services/{formData.slug || 'mon-service'}</p>
//                 </div>
//                 <Input label={`Meta Title (${formData.metaTitle.length}/60)`} value={formData.metaTitle}
//                   onChange={e => updateField('metaTitle', e.target.value.slice(0, 60))} placeholder="Titre SEO" />
//                 <Textarea label={`Meta Description (${formData.metaDescription.length}/160)`} value={formData.metaDescription}
//                   onChange={e => updateField('metaDescription', e.target.value.slice(0, 160))} placeholder="Description SEO" rows={3} />
//                 <div>
//                   <Input label="Keywords (virgules)" value={formData.keywords} onChange={e => updateField('keywords', e.target.value)} placeholder="cybersecurity, protection" />
//                   {formData.keywords && (
//                     <div className="mt-2 flex flex-wrap gap-1">
//                       {formData.keywords.split(',').map((kw, i) => kw.trim() && (
//                         <Badge key={i} variant="secondary" className="text-xs">{kw.trim()}</Badge>
//                       ))}
//                     </div>
//                   )}
//                 </div>
//                 <div className="border rounded-lg p-4 bg-gray-50">
//                   <h4 className="text-sm font-medium text-gray-700 mb-2">Aperçu Google</h4>
//                   <p className="text-blue-700 text-lg">{formData.metaTitle || 'Titre'}</p>
//                   <p className="text-green-700 text-sm">https://cyna.com/services/{formData.slug || '...'}</p>
//                   <p className="text-gray-600 text-sm">{formData.metaDescription || 'Description...'}</p>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* RIGHT: Live Preview */}
//         <div className="w-[420px] shrink-0 flex flex-col overflow-hidden border-l pl-6">
//           <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Prévisualisation webapp</h3>

//           <div className="flex-1 overflow-y-auto rounded-xl border border-gray-200 bg-white">
//             {/* Fake browser chrome */}
//             <div className="flex items-center gap-2 border-b bg-gray-50 px-3 py-1.5 sticky top-0 z-10">
//               <div className="flex gap-1">
//                 <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
//                 <div className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
//                 <div className="h-2.5 w-2.5 rounded-full bg-green-400" />
//               </div>
//               <div className="flex-1 ml-3 rounded bg-white px-2 py-0.5 text-[10px] text-gray-400 font-mono truncate">
//                 cyna.com/services/{formData.slug || '...'}
//               </div>
//             </div>

//             {/* Product page */}
//             <div className="p-4">
//               <p className="mb-3 text-[11px] text-gray-400">← Retour au catalogue</p>

//               {/* Image gallery */}
//               {formData.images.length > 0 ? (
//                 <div className="mb-4">
//                   <div className="relative h-40 overflow-hidden rounded-xl bg-gray-100">
//                     <img src={formData.images[previewImgIdx]?.url} alt=""
//                       className="h-full w-full object-contain"
//                       onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
//                     {formData.images.length > 1 && (
//                       <>
//                         <button onClick={() => setPreviewImgIdx(i => (i - 1 + formData.images.length) % formData.images.length)}
//                           className="absolute left-1 top-1/2 -translate-y-1/2 rounded-full bg-black/30 p-1 text-white"><ChevronLeft size={14} /></button>
//                         <button onClick={() => setPreviewImgIdx(i => (i + 1) % formData.images.length)}
//                           className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full bg-black/30 p-1 text-white"><ChevronRight size={14} /></button>
//                       </>
//                     )}
//                   </div>
//                   {formData.images.length > 1 && (
//                     <div className="flex gap-1.5 mt-2 overflow-x-auto">
//                       {formData.images.map((img, i) => (
//                         <button key={img.id} onClick={() => setPreviewImgIdx(i)}
//                           className={`h-10 w-10 shrink-0 overflow-hidden rounded-md border-2 ${i === previewImgIdx ? 'border-blue-600' : 'border-transparent'}`}>
//                           <img src={img.url} alt="" className="h-full w-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
//                         </button>
//                       ))}
//                     </div>
//                   )}
//                 </div>
//               ) : (
//                 <div className="mb-4 flex h-36 items-center justify-center rounded-xl bg-gradient-to-br from-blue-50 to-indigo-100">
//                   <span className="text-4xl font-bold text-blue-200">{formData.name ? formData.name.slice(0, 2).toUpperCase() : 'SV'}</span>
//                 </div>
//               )}

//               {formData.category && (
//                 <span className="mb-2 inline-block rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600">{formData.category}</span>
//               )}

//               <h2 className="mb-2 text-lg font-bold text-gray-900 leading-tight">{formData.name || 'Nom du service'}</h2>

//               {isService && (
//                 <div className="mb-3 flex gap-1.5">
//                   {(['mensuel', 'annuel'] as const).map(p => (
//                     <button key={p} onClick={() => setPreviewPeriod(p)}
//                       className={`rounded-md border px-3 py-1 text-xs font-medium transition ${p === previewPeriod ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300 bg-white text-gray-600'}`}>
//                       {p === 'mensuel' ? 'Mensuel' : 'Annuel'}
//                     </button>
//                   ))}
//                 </div>
//               )}

//               <div className="mb-3 text-2xl font-extrabold text-blue-600">
//                 {previewPrice > 0 ? (
//                   <>{previewPrice.toFixed(2)} {isService && <span className="text-sm font-normal text-gray-500">/{previewPeriod === 'mensuel' ? 'mois' : 'an'}</span>}</>
//                 ) : <span className="text-gray-400 text-lg">Prix sur devis</span>}
//               </div>

//               {isService && annualDiscount > 0 && previewPeriod === 'annuel' && (
//                 <span className="mb-3 inline-block rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-800">-{annualDiscount}%</span>
//               )}

//               <p className="mb-3 text-xs leading-relaxed text-gray-600">
//                 {formData.shortDescription || formData.longDescription || 'Description du service...'}
//               </p>

//               {formData.tags.length > 0 && (
//                 <div className="mb-3 flex flex-wrap gap-1">
//                   {formData.tags.map(tag => (
//                     <span key={tag} className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-700">{tag}</span>
//                   ))}
//                 </div>
//               )}

//               <button className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg bg-blue-600 py-2.5 text-sm text-white font-semibold cursor-default">
//                 <ShoppingCart className="h-4 w-4" />Ajouter au panier
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </Modal>
//   );
// }