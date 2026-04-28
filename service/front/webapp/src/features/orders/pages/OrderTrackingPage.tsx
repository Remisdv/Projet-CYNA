import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Package,
    Truck,
    CheckCircle2,
    Clock,
    Monitor,
    Key,
    Download,
    ExternalLink,
} from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { Badge } from '@/shared/components/ui/Badge';
import { useOrder, useOrderTracking, downloadInvoice } from '@/features/account/hooks/useOrders';

/* ─── Status helpers ─────────────────────────────────────────────── */
const statusLabels: Record<string, string> = {
    pending: 'En attente',
    confirmed: 'Confirmée',
    shipped: 'Expédiée',
    delivered: 'Livrée',
    cancelled: 'Annulée',
};

const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    shipped: 'bg-indigo-100 text-indigo-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
};

/* ─── Stepper component ──────────────────────────────────────────── */
function Stepper({ steps, current }: { steps: { label: string; icon: React.ReactNode }[]; current: number }) {
    return (
        <div className="flex items-center w-full">
            {steps.map((step, i) => {
                const done = i < current;
                const active = i === current;
                return (
                    <div key={i} className="flex items-center flex-1 last:flex-none">
                        <div className="flex flex-col items-center">
                            <div
                                className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors ${done
                                        ? 'border-green-500 bg-green-500 text-white'
                                        : active
                                            ? 'border-blue-500 bg-blue-50 text-blue-600'
                                            : 'border-gray-300 bg-white text-gray-400'
                                    }`}
                            >
                                {done ? <CheckCircle2 size={20} /> : step.icon}
                            </div>
                            <span
                                className={`mt-2 text-xs font-medium text-center ${done ? 'text-green-600' : active ? 'text-blue-600' : 'text-gray-400'
                                    }`}
                            >
                                {step.label}
                            </span>
                        </div>
                        {i < steps.length - 1 && (
                            <div
                                className={`flex-1 h-0.5 mx-2 mt-[-20px] ${done ? 'bg-green-500' : 'bg-gray-200'
                                    }`}
                            />
                        )}
                    </div>
                );
            })}
        </div>
    );
}

/* ─── Product Tracking Section ───────────────────────────────────── */
function ProductTrackingSection({
    status,
    trackingNumber,
    shippedAt,
}: {
    status: string;
    trackingNumber: string | null;
    shippedAt: string | null;
}) {
    const steps = [
        { label: 'En attente', icon: <Clock size={18} /> },
        { label: 'Confirmée', icon: <Package size={18} /> },
        { label: 'Expédiée', icon: <Truck size={18} /> },
        { label: 'Livrée', icon: <CheckCircle2 size={18} /> },
    ];

    const stepMap: Record<string, number> = {
        pending: 0,
        confirmed: 1,
        shipped: 2,
        delivered: 3,
        cancelled: -1,
    };

    const currentStep = stepMap[status] ?? 0;

    if (status === 'cancelled') {
        return (
            <div className="rounded-xl border border-red-200 bg-red-50 p-6">
                <h3 className="mb-2 text-lg font-semibold text-red-800 flex items-center gap-2">
                    <Package size={20} /> Livraison — Annulée
                </h3>
                <p className="text-sm text-red-600">Cette commande a été annulée.</p>
            </div>
        );
    }

    return (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="mb-6 text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Truck size={20} /> Suivi de livraison
            </h3>
            <Stepper steps={steps} current={currentStep} />
            {trackingNumber && (
                <div className="mt-6 rounded-lg border border-blue-100 bg-blue-50 p-4">
                    <p className="text-sm text-blue-800">
                        <strong>N° de suivi :</strong> {trackingNumber}
                    </p>
                    {shippedAt && (
                        <p className="mt-1 text-xs text-blue-600">
                            Expédiée le {new Date(shippedAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}

/* ─── Service Tracking Section ───────────────────────────────────── */
function ServiceTrackingSection({
    status,
    credentials,
}: {
    status: string;
    credentials: Array<{ serviceName: string; data: Record<string, string>; sentAt: string }>;
}) {
    const hasCredentials = credentials.length > 0;

    const steps = [
        { label: 'En attente', icon: <Clock size={18} /> },
        { label: 'Confirmée', icon: <Monitor size={18} /> },
        { label: 'Identifiants envoyés', icon: <Key size={18} /> },
        { label: 'Actif', icon: <CheckCircle2 size={18} /> },
    ];

    let currentStep = 0;
    if (status === 'confirmed' && !hasCredentials) currentStep = 1;
    else if (status === 'confirmed' && hasCredentials) currentStep = 2;
    else if (status === 'delivered' || status === 'shipped') currentStep = hasCredentials ? 3 : 2;
    else if (status === 'cancelled') currentStep = -1;

    if (status === 'cancelled') {
        return (
            <div className="rounded-xl border border-red-200 bg-red-50 p-6">
                <h3 className="mb-2 text-lg font-semibold text-red-800 flex items-center gap-2">
                    <Monitor size={20} /> Service — Annulé
                </h3>
                <p className="text-sm text-red-600">Cette commande a été annulée.</p>
            </div>
        );
    }

    return (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="mb-6 text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Monitor size={20} /> Suivi du service
            </h3>
            <Stepper steps={steps} current={currentStep} />

            {hasCredentials && (
                <div className="mt-6 space-y-3">
                    <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                        <Key size={16} /> Vos identifiants
                    </h4>
                    {credentials.map((cred, idx) => (
                        <div key={idx} className="rounded-lg border border-green-200 bg-green-50 p-4">
                            <p className="mb-2 font-semibold text-green-800">{cred.serviceName}</p>
                            <div className="space-y-1 text-sm">
                                {Object.entries(cred.data).map(([key, value]) => (
                                    <div key={key} className="flex items-center gap-2">
                                        <span className="text-gray-500 min-w-[100px]">{key} :</span>
                                        {key.toLowerCase() === 'url' ? (
                                            <a href={value} target="_blank" rel="noopener noreferrer" className="font-mono text-blue-600 hover:underline flex items-center gap-1">
                                                {value} <ExternalLink size={12} />
                                            </a>
                                        ) : (
                                            <span className="font-mono font-medium text-gray-900">{value}</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <p className="mt-2 text-xs text-green-600">
                                Envoyé le {new Date(cred.sentAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                            </p>
                        </div>
                    ))}
                </div>
            )}

            {!hasCredentials && status !== 'pending' && (
                <div className="mt-6 rounded-lg border border-yellow-100 bg-yellow-50 p-4">
                    <p className="text-sm text-yellow-800">
                        Vos identifiants sont en cours de préparation. Vous recevrez un email dès qu'ils seront disponibles.
                    </p>
                </div>
            )}
        </div>
    );
}

/* ─── Main page ──────────────────────────────────────────────────── */
export default function OrderTrackingPage() {
    const { orderId } = useParams<{ orderId: string }>();
    const navigate = useNavigate();
    const { data: order, isLoading: orderLoading } = useOrder(orderId ?? '');
    const { data: tracking, isLoading: trackingLoading } = useOrderTracking(orderId ?? '');

    const isLoading = orderLoading || trackingLoading;

    if (isLoading) {
        return (
            <div className="mx-auto max-w-3xl px-4 py-16 text-center text-gray-500">
                Chargement du suivi...
            </div>
        );
    }

    if (!order) {
        return (
            <div className="mx-auto max-w-3xl px-4 py-16 text-center">
                <p className="text-gray-500">Commande introuvable.</p>
                <Button className="mt-4" variant="outline" onClick={() => navigate('/account')}>
                    Retour à mon compte
                </Button>
            </div>
        );
    }

    const hasProducts = order.items.some(i => (i.productType || i.type) === 'produit');
    const hasServices = order.items.some(i => (i.productType || i.type) === 'service');
    const status = tracking?.status || order.status;
    const productItems = order.items.filter(i => (i.productType || i.type) === 'produit');
    const serviceItems = order.items.filter(i => (i.productType || i.type) === 'service');

    return (
        <div className="mx-auto max-w-3xl px-4 py-10 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" onClick={() => navigate('/account')}>
                    <ArrowLeft size={16} className="mr-1" /> Retour
                </Button>
            </div>

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Suivi de commande</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Réf. <span className="font-mono font-semibold">{order.ref}</span>
                        {' — '}
                        {new Date(order.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </p>
                </div>
                <Badge className={statusColors[status] || 'bg-gray-100 text-gray-800'}>
                    {statusLabels[status] || status}
                </Badge>
            </div>

            {/* Order summary */}
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <h3 className="mb-3 text-sm font-semibold text-gray-700 uppercase tracking-wide">Articles</h3>
                <div className="divide-y">
                    {order.items.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between py-2">
                            <div className="flex items-center gap-2">
                                {(item.productType || item.type) === 'service' ? (
                                    <Monitor size={14} className="text-purple-500" />
                                ) : (
                                    <Package size={14} className="text-blue-500" />
                                )}
                                <span className="text-sm text-gray-900">{item.productName}</span>
                                <span className="text-xs text-gray-400">x{item.quantity}</span>
                            </div>
                            <span className="text-sm font-semibold text-gray-700">
                                {(item.unitPrice * item.quantity).toFixed(2)} €
                            </span>
                        </div>
                    ))}
                </div>
                <div className="mt-3 flex justify-between border-t pt-3">
                    <span className="font-semibold text-gray-900">Total</span>
                    <span className="font-bold text-blue-600">{Number(order.amount).toFixed(2)} €</span>
                </div>
            </div>

            {/* Product tracking */}
            {hasProducts && (
                <ProductTrackingSection
                    status={status}
                    trackingNumber={tracking?.trackingNumber || null}
                    shippedAt={tracking?.shippedAt || null}
                />
            )}

            {/* Service tracking */}
            {hasServices && (
                <ServiceTrackingSection
                    status={status}
                    credentials={tracking?.credentials || []}
                />
            )}

            {/* Actions */}
            <div className="flex justify-center gap-3 pt-4">
                <Button variant="outline" onClick={() => downloadInvoice(order.id)}>
                    <Download size={14} className="mr-2" /> Télécharger la facture
                </Button>
                <Button variant="outline" onClick={() => navigate('/catalog')}>
                    Continuer mes achats
                </Button>
            </div>
        </div>
    );
}
