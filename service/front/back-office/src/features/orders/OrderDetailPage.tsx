import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Textarea } from '../../components/ui/Textarea';
import { Input } from '../../components/ui/Input';
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
  Key,
  Send,
  Monitor,
} from 'lucide-react';
import {
  useOrderDetail,
  useUpdateOrderStatus,
  useUpdatePaymentStatus,
  useAddOrderNote,
  useSendCredentials,
} from './hooks/useOrders';

export default function OrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [newNote, setNewNote] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [showTrackingInput, setShowTrackingInput] = useState(false);
  const [showCredentialsForm, setShowCredentialsForm] = useState(false);
  const [credentialsData, setCredentialsData] = useState<Record<string, Record<string, string>>>({});
  const [credentialsMessage, setCredentialsMessage] = useState('');

  const { data: order, isLoading, isError } = useOrderDetail(orderId ?? '');
  const updateStatus = useUpdateOrderStatus();
  const updatePayment = useUpdatePaymentStatus();
  const addNote = useAddOrderNote();
  const sendCredentials = useSendCredentials();

  if (isLoading) {
    return <div className="flex items-center justify-center h-64 text-gray-500">Chargement...</div>;
  }

  if (isError || !order) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-gray-500">Commande introuvable.</p>
        <button onClick={() => navigate('/orders')} className="text-blue-600 underline text-sm">Retour aux commandes</button>
      </div>
    );
  }

  const handleConfirmPayment = () => {
    if (confirm('Confirmer le paiement de cette commande ?')) {
      updatePayment.mutate({ id: order.id, paymentStatus: 'paid' });
    }
  };

  const handleGenerateInvoice = () => {
    alert(`Génération de la facture pour ${order.ref} (fonctionnalité à venir)`);
  };

  const handleMarkShipped = () => {
    if (showTrackingInput) {
      updateStatus.mutate({
        id: order.id,
        status: 'shipped',
        trackingNumber: trackingNumber || undefined,
      });
      setShowTrackingInput(false);
      setTrackingNumber('');
    } else {
      setShowTrackingInput(true);
    }
  };

  const handleMarkDelivered = () => {
    if (confirm('Confirmer la livraison ?')) {
      updateStatus.mutate({ id: order.id, status: 'delivered' });
    }
  };

  const handleCancel = () => {
    if (confirm('Êtes-vous sûr de vouloir annuler cette commande ?')) {
      updateStatus.mutate({ id: order.id, status: 'cancelled' });
    }
  };

  const handleConfirmOrder = () => {
    if (confirm('Confirmer cette commande ?')) {
      updateStatus.mutate({ id: order.id, status: 'confirmed' });
    }
  };

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    addNote.mutate({ id: order.id, text: newNote });
    setNewNote('');
    setIsAddingNote(false);
  };

  // Detect order type from items
  const hasProducts = order.items.some(i => i.productType === 'produit');
  const hasServices = order.items.some(i => i.productType === 'service');
  const serviceItems = order.items.filter(i => i.productType === 'service');

  const handleSendCredentials = () => {
    const credentials = Object.entries(credentialsData)
      .filter(([, data]) => Object.values(data).some(v => v.trim()))
      .map(([serviceName, data]) => ({ serviceName, data }));

    if (credentials.length === 0) return;

    sendCredentials.mutate({
      id: order.id,
      credentials,
      customMessage: credentialsMessage || undefined,
    }, {
      onSuccess: () => {
        setShowCredentialsForm(false);
        setCredentialsData({});
        setCredentialsMessage('');
      },
    });
  };

  const updateCredentialField = (serviceName: string, field: string, value: string) => {
    setCredentialsData(prev => ({
      ...prev,
      [serviceName]: {
        ...(prev[serviceName] || {}),
        [field]: value,
      },
    }));
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'confirmed': return 'Confirmée';
      case 'shipped': return 'Expédiée';
      case 'delivered': return 'Livrée';
      case 'cancelled': return 'Annulée';
      default: return status;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'confirmed': return 'default';
      case 'shipped': return 'secondary';
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
              Créée le {new Date(order.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
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
              <Button onClick={handleConfirmPayment} disabled={updatePayment.isPending}>
                <Check className="h-4 w-4 mr-2" />
                Confirmer paiement
              </Button>
            )}
            {order.status === 'pending' && order.paymentStatus === 'paid' && (
              <Button onClick={handleConfirmOrder} disabled={updateStatus.isPending}>
                <Check className="h-4 w-4 mr-2" />
                Confirmer commande
              </Button>
            )}
            <Button variant="outline" onClick={handleGenerateInvoice}>
              <FileText className="h-4 w-4 mr-2" />
              Générer facture PDF
            </Button>
            {order.status === 'confirmed' && hasProducts && (
              <Button variant="outline" onClick={handleMarkShipped} disabled={updateStatus.isPending}>
                <Truck className="h-4 w-4 mr-2" />
                {showTrackingInput ? 'Confirmer expédition' : 'Marquer expédiée'}
              </Button>
            )}
            {showTrackingInput && (
              <Input
                placeholder="N° de suivi (optionnel)"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                className="w-64"
              />
            )}
            {order.status === 'shipped' && (
              <Button variant="outline" onClick={handleMarkDelivered} disabled={updateStatus.isPending}>
                <Check className="h-4 w-4 mr-2" />
                Marquer livrée
              </Button>
            )}
            {hasServices && (order.status === 'confirmed' || order.status === 'delivered') && (
              <Button variant="outline" onClick={() => setShowCredentialsForm(!showCredentialsForm)} disabled={sendCredentials.isPending}>
                <Key className="h-4 w-4 mr-2" />
                Envoyer identifiants
              </Button>
            )}
            {order.status !== 'cancelled' && order.status !== 'delivered' && (
              <Button variant="destructive" onClick={handleCancel} disabled={updateStatus.isPending}>
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
                    <TableHead>Type</TableHead>
                    <TableHead className="text-center">Quantité</TableHead>
                    <TableHead className="text-right">Prix unitaire</TableHead>
                    <TableHead className="text-right">Sous-total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.productName}</TableCell>
                      <TableCell>
                        <Badge variant={item.productType === 'service' ? 'secondary' : 'default'}>
                          {item.productType === 'service' ? (
                            <><Monitor className="h-3 w-3 mr-1 inline" />Service</>
                          ) : (
                            <><Package className="h-3 w-3 mr-1 inline" />Produit</>
                          )}
                        </Badge>
                      </TableCell>
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

          {/* Credentials Form (Services) */}
          {showCredentialsForm && hasServices && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  Envoyer les identifiants
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {serviceItems.map((item) => (
                  <div key={item.id} className="border rounded-lg p-4 space-y-3">
                    <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                      <Monitor className="h-4 w-4" />
                      {item.productName}
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        label="Identifiant / Login"
                        placeholder="ex: user@example.com"
                        value={credentialsData[item.productName]?.login || ''}
                        onChange={(e) => updateCredentialField(item.productName, 'login', e.target.value)}
                      />
                      <Input
                        label="Mot de passe"
                        placeholder="ex: P@ssw0rd123"
                        value={credentialsData[item.productName]?.password || ''}
                        onChange={(e) => updateCredentialField(item.productName, 'password', e.target.value)}
                      />
                      <Input
                        label="URL d'accès"
                        placeholder="ex: https://app.cyna.com"
                        value={credentialsData[item.productName]?.url || ''}
                        onChange={(e) => updateCredentialField(item.productName, 'url', e.target.value)}
                      />
                      <Input
                        label="Clé de licence"
                        placeholder="ex: XXXX-XXXX-XXXX"
                        value={credentialsData[item.productName]?.licenseKey || ''}
                        onChange={(e) => updateCredentialField(item.productName, 'licenseKey', e.target.value)}
                      />
                    </div>
                  </div>
                ))}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Message personnalisé (optionnel)</label>
                  <Textarea
                    value={credentialsMessage}
                    onChange={(e) => setCredentialsMessage(e.target.value)}
                    placeholder="Instructions supplémentaires pour le client..."
                    rows={3}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleSendCredentials} disabled={sendCredentials.isPending}>
                    <Send className="h-4 w-4 mr-2" />
                    {sendCredentials.isPending ? 'Envoi...' : 'Envoyer par email'}
                  </Button>
                  <Button variant="outline" onClick={() => setShowCredentialsForm(false)}>
                    Annuler
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Already Sent Credentials */}
          {order.credentials && order.credentials.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  Identifiants envoyés
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {order.credentials.map((cred, idx) => (
                  <div key={idx} className="border rounded-lg p-3 bg-green-50 border-green-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-green-800">{cred.serviceName}</span>
                      <span className="text-xs text-green-600">
                        Envoyé le {new Date(cred.sentAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {Object.entries(cred.data).map(([key, value]) => (
                        <div key={key}>
                          <span className="text-gray-500">{key} : </span>
                          <span className="font-mono font-medium">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

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
