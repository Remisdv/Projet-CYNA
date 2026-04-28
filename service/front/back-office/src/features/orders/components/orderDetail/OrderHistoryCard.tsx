import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/Card';
import { Calendar } from 'lucide-react';

interface HistEntry {
  id: string | number;
  action: string;
  date: string | Date;
  by: string;
}

export function OrderHistoryCard({ history }: { history: HistEntry[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Historique
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {history.map((entry) => (
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
  );
}
