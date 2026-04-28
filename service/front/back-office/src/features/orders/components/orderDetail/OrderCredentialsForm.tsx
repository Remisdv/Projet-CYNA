import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Textarea } from '@/shared/components/ui/Textarea';
import { Key, Monitor, Send } from 'lucide-react';

interface ServiceItem {
  id: string | number;
  productName: string;
}

interface Props {
  serviceItems: ServiceItem[];
  credentialsData: Record<string, Record<string, string>>;
  credentialsMessage: string;
  setCredentialsMessage: (v: string) => void;
  updateCredentialField: (serviceName: string, field: string, value: string) => void;
  onSend: () => void;
  onCancel: () => void;
  isPending: boolean;
}

export function OrderCredentialsForm({
  serviceItems, credentialsData, credentialsMessage, setCredentialsMessage,
  updateCredentialField, onSend, onCancel, isPending,
}: Props) {
  return (
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
          <Button onClick={onSend} disabled={isPending}>
            <Send className="h-4 w-4 mr-2" />
            {isPending ? 'Envoi...' : 'Envoyer par email'}
          </Button>
          <Button variant="outline" onClick={onCancel}>
            Annuler
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
