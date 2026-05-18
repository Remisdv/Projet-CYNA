import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { Textarea } from '@/shared/components/ui/Textarea';
import { MessageSquarePlus } from 'lucide-react';

interface Note {
  id: string | number;
  text: string;
  date: string | Date;
  by: string;
}

interface Props {
  notes: Note[];
  isAddingNote: boolean;
  newNote: string;
  setNewNote: (v: string) => void;
  onAdd: () => void;
  onCancel: () => void;
}

export function OrderNotesCard({ notes, isAddingNote, newNote, setNewNote, onAdd, onCancel }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquarePlus className="h-5 w-5" />
          Notes internes
        </CardTitle>
      </CardHeader>
      <CardContent>
        {notes.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">
            Aucune note
          </p>
        ) : (
          <div className="space-y-3">
            {notes.map((note) => (
              <div key={note.id} className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-gray-900">{note.text}</p>
                <p className="text-xs text-gray-500 mt-2">
                  {new Date(note.date).toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })} — {note.by}
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
              <Button size="sm" onClick={onAdd}>
                Ajouter
              </Button>
              <Button size="sm" variant="outline" onClick={onCancel}>
                Annuler
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
