import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Textarea } from '../../components/ui/Textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/Table';
import {
  ArrowLeft,
  Check,
  FileText,
  Truck,
  X,
  MessageSquarePlus,
  CreditCard,
  User,
  MapPin,
  Package,
  Calendar,
  DollarSign,
} from 'lucide-react';

// ========== MOCK DATA ==========

interface OrderItem {
  id: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

interface OrderDetail {
  id: string;
  ref: string;
  status: 'pending' | 'confirmed' | 'delivered' | 'cancelled';
  date: string;

  // Client info
  clientEmail: string;
  clientFirstName: string;
  clientLastName: string;
  billingAddress: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };

  // Items
  items: OrderItem[];

  // Financial
  subtotal: number;
  tax: number;
  total: number;

  // Payment
  paymentRef: string;
  paymentAmount: number;
  paymentStatus: 'pending' | 'paid' | 'refunded';
  paymentDate?: string;

  // History
  history: Array<{
    id: string;
    action: string;
    date: string;
    by: string;
  }>;

  // Notes
  notes: Array<{
    id: string;
    text: string;
    date: string;
    by: string;
  }>;
}

const generateMockOrderDetail = (orderId: string): OrderDetail => {
  const items: OrderItem[] = [
    { id: '1', productName: 'SOC Monitoring Pro', quantity: 2, unitPrice: 299.99, subtotal: 599.98 },
    { id: '2', productName: 'EDR Protection Advanced', quantity: 1, unitPrice: 499.99, subtotal: 499.99 },
    { id: '3', productName: 'Threat Intelligence Feed', quantity: 1, unitPrice: 149.99, subtotal: 149.99 },
  ];

  const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
  const tax = subtotal * 0.2; // 20% TVA
  const total = subtotal + tax;

  return {
    id: orderId,
    ref: `ORD-${Date.now()}-${orderId}`,
    status: 'confirmed',
    date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),

    clientEmail: 'jean.dupont@email.com',
    clientFirstName: 'Jean',
    clientLastName: 'Dupont',
    billingAddress: {
      street: '123 Rue de la République',
      city: 'Paris',
      postalCode: '75001',
      country: 'France',
    },

    items,

    subtotal,
    tax,
    total,

    paymentRef: `pi_${Math.random().toString(36).substring(7)}`,
    paymentAmount: total,
    paymentStatus: 'paid',
    paymentDate: new Date(Date.now() - Math.random() * 25 * 24 * 60 * 60 * 1000).toISOString(),

    history: [
      {
        id: '1',
        action: 'Commande créée',
        date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        by: 'Système',
      },
      {
        id: '2',
        action: 'Paiement confirmé',
        date: new Date(Date.now() - 29 * 24 * 60 * 60 * 1000).toISOString(),
        by: 'Stripe',
      },
      {
        id: '3',
        action: 'Commande confirmée',
        date: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(),
        by: 'Admin',
      },
    ],

    notes: [
      {
        id: '1',
        text: 'Client a demandé une livraison urgente',
        date: new Date(Date.now() - 27 * 24 * 60 * 60 * 1000).toISOString(),
        by: 'Jean Martin (Commercial)',
      },
    ],
  };
};

export default function OrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [newNote, setNewNote] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);

  // Mock order detail
  const order = generateMockOrderDetail(orderId || '001');

  const handleConfirmPayment = () => {
    if (confirm('Confirmer le paiement de cette commande ?')) {
      console.log('Confirming payment for order:', order.ref);
      alert('Paiement confirmé (mock)');
    }
  };

  const handleGenerateInvoice = () => {
    console.log('Generating invoice for order:', order.ref);
    alert(`Génération de la facture pour ${order.ref} (mock)`);
  };

  const handleMarkDelivered = () => {
    if (confirm('Marquer cette commande comme livrée ?')) {
      console.log('Marking order as delivered:', order.ref);
      alert('Commande marquée comme livrée (mock)');
    }
  };

  const handleCancel = () => {
    if (confirm('Êtes-vous sûr de vouloir annuler cette commande ?')) {
      console.log('Cancelling order:', order.ref);
      alert('Commande annulée (mock)');
    }
  };

  const handleAddNote = () => {
    if (!newNote.trim()) return;

    console.log('Adding note:', newNote);
    alert('Note ajoutée (mock)');
    setNewNote('');
    setIsAddingNote(false);
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'confirmed': return 'Confirmée';
      case 'delivered': return 'Livrée';
      case 'cancelled': return 'Annulée';
      default: return status;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'confirmed': return 'default';
      case 'delivered': return 'success';
      case 'cancelled': return 'destructive';
      default: return 'secondary';
    }
  };

  const getPaymentStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'paid': return 'Payé';
      case 'refunded': return 'Remboursé';
      default: return status;
    }
  };

  const getPaymentStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'paid': return 'success';
      case 'refunded': return 'secondary';
      default: return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => navigate('/orders')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Commande {order.ref}
            </h1>
            <p className="text-gray-500 mt-1">
              Créée le {new Date(order.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>
        <Badge variant={getStatusBadgeVariant(order.status)} className="text-base px-4 py-2">
          {getStatusLabel(order.status)}
        </Badge>
      </div>

      {/* Actions */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-wrap gap-2">
            {order.paymentStatus === 'pending' && (
              <Button onClick={handleConfirmPayment}>
                <Check className="h-4 w-4 mr-2" />
                Confirmer paiement
              </Button>
            )}
            <Button variant="outline" onClick={handleGenerateInvoice}>
              <FileText className="h-4 w-4 mr-2" />
              Générer facture PDF
            </Button>
            {order.status === 'confirmed' && (
              <Button variant="outline" onClick={handleMarkDelivered}>
                <Truck className="h-4 w-4 mr-2" />
                Marquer livrée
              </Button>
            )}
            {order.status !== 'cancelled' && order.status !== 'delivered' && (
              <Button variant="destructive" onClick={handleCancel}>
                <X className="h-4 w-4 mr-2" />
                Annuler commande
              </Button>
            )}
            <Button
              variant="secondary"
              onClick={() => setIsAddingNote(true)}
              className="ml-auto"
            >
              <MessageSquarePlus className="h-4 w-4 mr-2" />
              Ajouter note
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - 2/3 width */}
        <div className="lg:col-span-2 space-y-6">
          {/* Client Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informations client
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Nom complet</p>
                  <p className="font-medium">{order.clientFirstName} {order.clientLastName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{order.clientEmail}</p>
                </div>
              </div>

              <div className="mt-4">
                <div className="flex items-start gap-2">
                  <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Adresse de facturation</p>
                    <p className="font-medium">{order.billingAddress.street}</p>
                    <p className="font-medium">{order.billingAddress.postalCode} {order.billingAddress.city}</p>
                    <p className="font-medium">{order.billingAddress.country}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Articles commandés
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produit</TableHead>
                    <TableHead className="text-center">Quantité</TableHead>
                    <TableHead className="text-right">Prix unitaire</TableHead>
                    <TableHead className="text-right">Sous-total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.productName}</TableCell>
                      <TableCell className="text-center">{item.quantity}</TableCell>
                      <TableCell className="text-right">{item.unitPrice.toFixed(2)} €</TableCell>
                      <TableCell className="text-right font-semibold">{item.subtotal.toFixed(2)} €</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Financial Summary */}
              <div className="mt-6 border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Sous-total</span>
                  <span className="font-medium">{order.subtotal.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">TVA (20%)</span>
                  <span className="font-medium">{order.tax.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Montant total</span>
                  <span className="text-blue-600">{order.total.toFixed(2)} €</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Historique
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.history.map((entry) => (
                  <div key={entry.id} className="flex gap-4">
                    <div className="flex-shrink-0 w-2 bg-blue-600 rounded-full"></div>
                    <div className="flex-1 pb-4 border-b last:border-0">
                      <p className="font-medium text-gray-900">{entry.action}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {new Date(entry.date).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })} par {entry.by}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - 1/3 width */}
        <div className="space-y-6">
          {/* Payment Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Paiement
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Référence Stripe</p>
                <p className="font-mono text-sm font-medium">{order.paymentRef}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Montant</p>
                <p className="font-semibold text-lg">{order.paymentAmount.toFixed(2)} €</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Statut</p>
                <Badge variant={getPaymentStatusBadgeVariant(order.paymentStatus)}>
                  {getPaymentStatusLabel(order.paymentStatus)}
                </Badge>
              </div>
              {order.paymentDate && (
                <div>
                  <p className="text-sm text-gray-500">Date de paiement</p>
                  <p className="font-medium">
                    {new Date(order.paymentDate).toLocaleDateString('fr-FR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquarePlus className="h-5 w-5" />
                Notes internes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {order.notes.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  Aucune note
                </p>
              ) : (
                <div className="space-y-3">
                  {order.notes.map((note) => (
                    <div key={note.id} className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <p className="text-sm text-gray-900">{note.text}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(note.date).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })} - {note.by}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {isAddingNote && (
                <div className="mt-4 space-y-2">
                  <Textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Ajouter une note interne..."
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleAddNote}>
                      Ajouter
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setIsAddingNote(false);
                        setNewNote('');
                      }}
                    >
                      Annuler
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
