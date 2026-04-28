import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/shared/components/ui/Button';
import { Badge } from '@/shared/components/ui/Badge';
import { ArrowLeft } from 'lucide-react';
import {
  useOrderDetail,
  useUpdateOrderStatus,
  useUpdatePaymentStatus,
  useAddOrderNote,
  useSendCredentials,
} from '../hooks/useOrders';
import { getStatusBadgeVariant, getStatusLabel } from '../lib/orderDetailLabels';
import { OrderActionsBar } from '../components/orderDetail/OrderActionsBar';
import { OrderClientInfoCard } from '../components/orderDetail/OrderClientInfoCard';
import { OrderItemsCard } from '../components/orderDetail/OrderItemsCard';
import { OrderCredentialsForm } from '../components/orderDetail/OrderCredentialsForm';
import { OrderCredentialsSent } from '../components/orderDetail/OrderCredentialsSent';
import { OrderHistoryCard } from '../components/orderDetail/OrderHistoryCard';
import { OrderPaymentCard } from '../components/orderDetail/OrderPaymentCard';
import { OrderNotesCard } from '../components/orderDetail/OrderNotesCard';

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
    alert(`GÃ©nÃ©ration de la facture pour ${order.ref} (fonctionnalitÃ© Ã  venir)`);
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
    if (confirm('ÃŠtes-vous sÃ»r de vouloir annuler cette commande ?')) {
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

  return (
    <div className="space-y-6">
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
              CrÃ©Ã©e le {new Date(order.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>
        <Badge variant={getStatusBadgeVariant(order.status)} className="text-base px-4 py-2">
          {getStatusLabel(order.status)}
        </Badge>
      </div>

      <OrderActionsBar
        status={order.status}
        paymentStatus={order.paymentStatus}
        hasProducts={hasProducts}
        hasServices={hasServices}
        showTrackingInput={showTrackingInput}
        trackingNumber={trackingNumber}
        setTrackingNumber={setTrackingNumber}
        showCredentialsForm={showCredentialsForm}
        isPendingPayment={updatePayment.isPending}
        isPendingStatus={updateStatus.isPending}
        isPendingCredentials={sendCredentials.isPending}
        onConfirmPayment={handleConfirmPayment}
        onConfirmOrder={handleConfirmOrder}
        onGenerateInvoice={handleGenerateInvoice}
        onMarkShipped={handleMarkShipped}
        onMarkDelivered={handleMarkDelivered}
        onToggleCredentials={() => setShowCredentialsForm(!showCredentialsForm)}
        onCancel={handleCancel}
        onAddNote={() => setIsAddingNote(true)}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <OrderClientInfoCard
            firstName={order.clientFirstName}
            lastName={order.clientLastName}
            email={order.clientEmail}
            billingAddress={order.billingAddress}
          />

          <OrderItemsCard
            items={order.items}
            subtotal={order.subtotal}
            tax={order.tax}
            total={order.total}
          />

          {showCredentialsForm && hasServices && (
            <OrderCredentialsForm
              serviceItems={serviceItems}
              credentialsData={credentialsData}
              credentialsMessage={credentialsMessage}
              setCredentialsMessage={setCredentialsMessage}
              updateCredentialField={updateCredentialField}
              onSend={handleSendCredentials}
              onCancel={() => setShowCredentialsForm(false)}
              isPending={sendCredentials.isPending}
            />
          )}

          {order.credentials && order.credentials.length > 0 && (
            <OrderCredentialsSent credentials={order.credentials} />
          )}

          <OrderHistoryCard history={order.history} />
        </div>

        <div className="space-y-6">
          <OrderPaymentCard
            paymentRef={order.paymentRef}
            paymentAmount={order.paymentAmount}
            paymentStatus={order.paymentStatus}
            paymentDate={order.paymentDate}
          />

          <OrderNotesCard
            notes={order.notes}
            isAddingNote={isAddingNote}
            newNote={newNote}
            setNewNote={setNewNote}
            onAdd={handleAddNote}
            onCancel={() => { setIsAddingNote(false); setNewNote(''); }}
          />
        </div>
      </div>
    </div>
  );
}
