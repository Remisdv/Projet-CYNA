import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/Card';
import { Key } from 'lucide-react';

interface Cred {
  serviceName: string;
  data: Record<string, string>;
  sentAt: string | Date;
}

export function OrderCredentialsSent({ credentials }: { credentials: Cred[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5" />
          Identifiants envoyés
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {credentials.map((cred, idx) => (
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
  );
}
