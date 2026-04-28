import ReactMarkdown from 'react-markdown';
import { ChevronLeft, ChevronRight, ShoppingCart } from 'lucide-react';
import type { ServiceFormData } from '../../types/serviceForm.types';

interface Props {
  formData: ServiceFormData;
  previewPeriod: 'mensuel' | 'annuel';
  setPreviewPeriod: (p: 'mensuel' | 'annuel') => void;
  previewImgIdx: number;
  setPreviewImgIdx: (updater: number | ((i: number) => number)) => void;
  annualDiscount: number;
}

export function ServiceFormPreview({ formData, previewPeriod, setPreviewPeriod, previewImgIdx, setPreviewImgIdx, annualDiscount }: Props) {
  const isService = formData.type === 'service';
  const previewPrice = isService
    ? (previewPeriod === 'mensuel' ? formData.monthlyPrice : formData.annualPrice)
    : formData.price;

  return (
    <div className="w-[400px] shrink-0 flex flex-col bg-gray-50">
      <div className="shrink-0 px-5 py-4 border-b bg-white">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Aperçu webapp</h3>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          {/* Browser chrome */}
          <div className="flex items-center gap-2 border-b bg-gray-100 px-3 py-2 sticky top-0 z-10">
            <div className="flex gap-1.5">
              <div className="h-3 w-3 rounded-full bg-red-400" />
              <div className="h-3 w-3 rounded-full bg-yellow-400" />
              <div className="h-3 w-3 rounded-full bg-green-400" />
            </div>
            <div className="flex-1 ml-2 rounded bg-white px-2 py-0.5 text-[10px] text-gray-400 font-mono truncate border">
              cyna.com/services/{formData.slug || '...'}
            </div>
          </div>

          <div className="p-5">
            <p className="mb-4 text-xs text-gray-400">← Retour au catalogue</p>

            {/* Image */}
            {formData.images.length > 0 ? (
              <div className="mb-5">
                <div className="relative h-48 overflow-hidden rounded-xl bg-gray-100">
                  <img
                    src={formData.images[previewImgIdx]?.url}
                    alt=""
                    className="h-full w-full object-contain"
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                  {formData.images.length > 1 && (
                    <>
                      <button onClick={() => setPreviewImgIdx(i => (i - 1 + formData.images.length) % formData.images.length)}
                        className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/30 p-1.5 text-white hover:bg-black/50">
                        <ChevronLeft size={16} />
                      </button>
                      <button onClick={() => setPreviewImgIdx(i => (i + 1) % formData.images.length)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/30 p-1.5 text-white hover:bg-black/50">
                        <ChevronRight size={16} />
                      </button>
                    </>
                  )}
                </div>
                {formData.images.length > 1 && (
                  <div className="flex gap-2 mt-2 overflow-x-auto pb-1">
                    {formData.images.map((img, i) => (
                      <button key={img.id} onClick={() => setPreviewImgIdx(i)}
                        className={`h-12 w-12 shrink-0 overflow-hidden rounded-lg border-2 transition ${i === previewImgIdx ? 'border-blue-600' : 'border-transparent'}`}>
                        <img src={img.url} alt="" className="h-full w-full object-cover"
                          onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="mb-5 flex h-44 items-center justify-center rounded-xl bg-gradient-to-br from-blue-50 to-indigo-100">
                <span className="text-5xl font-black text-blue-200">{formData.name ? formData.name.slice(0, 2).toUpperCase() : 'SV'}</span>
              </div>
            )}

            {formData.category && (
              <span className="mb-2 inline-block rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">{formData.category}</span>
            )}

            <h2 className="mt-2 mb-3 text-xl font-bold text-gray-900 leading-tight">
              {formData.name || <span className="text-gray-300">Nom du service</span>}
            </h2>

            {isService && (
              <div className="mb-4 flex gap-2">
                {(['mensuel', 'annuel'] as const).map(p => (
                  <button
                    key={p}
                    onClick={() => setPreviewPeriod(p)}
                    className={`rounded-lg border px-4 py-1.5 text-sm font-medium transition ${p === previewPeriod ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300 bg-white text-gray-600 hover:border-gray-400'
                      }`}
                  >
                    {p === 'mensuel' ? 'Mensuel' : 'Annuel'}
                  </button>
                ))}
              </div>
            )}

            <div className="mb-4 flex items-baseline gap-2">
              {previewPrice > 0 ? (
                <>
                  <span className="text-3xl font-extrabold text-blue-600">{previewPrice.toFixed(2)} €</span>
                  {isService && (
                    <span className="text-sm text-gray-500">/{previewPeriod === 'mensuel' ? 'mois' : 'an'}</span>
                  )}
                </>
              ) : (
                <span className="text-xl font-semibold text-gray-400">Prix sur devis</span>
              )}
              {isService && annualDiscount > 0 && previewPeriod === 'annuel' && (
                <span className="ml-2 rounded-full bg-green-100 px-2 py-0.5 text-xs font-bold text-green-700">-{annualDiscount}%</span>
              )}
            </div>

            {formData.shortDescription && (
              <p className="mb-3 text-sm leading-relaxed text-gray-700">{formData.shortDescription}</p>
            )}
            {formData.longDescription ? (
              <div className="mb-4 text-sm leading-relaxed text-gray-600
                [&>h1]:text-base [&>h1]:font-bold [&>h1]:text-gray-900 [&>h1]:mt-3 [&>h1]:mb-1.5
                [&>h2]:text-sm [&>h2]:font-semibold [&>h2]:text-gray-800 [&>h2]:mt-2.5 [&>h2]:mb-1
                [&>h3]:text-sm [&>h3]:font-semibold [&>h3]:text-gray-800 [&>h3]:mt-2 [&>h3]:mb-1
                [&>p]:mb-2 [&>p]:leading-relaxed
                [&>ul]:mb-2 [&>ul]:pl-4 [&>ul>li]:list-disc [&>ul>li]:mb-0.5
                [&>ol]:mb-2 [&>ol]:pl-4 [&>ol>li]:list-decimal [&>ol>li]:mb-0.5
                [&>strong]:font-semibold [&>strong]:text-gray-800
                [&>em]:italic">
                <ReactMarkdown>{formData.longDescription}</ReactMarkdown>
              </div>
            ) : !formData.shortDescription && (
              <p className="mb-4 text-sm italic text-gray-300">Description du service...</p>
            )}

            {formData.tags.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-1.5">
                {formData.tags.map(tag => (
                  <span key={tag} className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">{tag}</span>
                ))}
              </div>
            )}

            <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-bold text-white cursor-default shadow-sm">
              <ShoppingCart className="h-4 w-4" />
              Ajouter au panier
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
