import { useState } from 'react';
import {
  useFaqTree,
  useDeleteFaq,
  Faq,
} from '../../services/queries';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Plus, Edit, Trash2, ChevronRight, ChevronDown, FileQuestion } from 'lucide-react';
import FaqFormModal from './FaqFormModal';

interface FaqTreeItemProps {
  faq: Faq;
  level: number;
  onEdit: (faq: Faq) => void;
  onDelete: (id: string) => void;
  onAddChild: (parentId: string) => void;
}

function FaqTreeItem({ faq, level, onEdit, onDelete, onAddChild }: FaqTreeItemProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = faq.children && faq.children.length > 0;
  const isLeaf = faq.answer && faq.answer.trim() !== '';

  return (
    <div className="border-l-2 border-gray-200 pl-4 ml-4">
      <div className="flex items-start gap-3 py-3 group hover:bg-gray-50 -ml-4 pl-4 rounded">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-1 text-gray-400 hover:text-gray-600"
          disabled={!hasChildren}
        >
          {hasChildren ? (
            isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )
          ) : (
            <div className="w-4" />
          )}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2">
            <div className="flex-1">
              <h4 className="font-medium text-gray-900">{faq.question}</h4>
              {isLeaf && faq.answer && (
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">{faq.answer}</p>
              )}
              <div className="flex gap-2 mt-2">
                <Badge variant={faq.lang === 'fr' ? 'default' : 'secondary'}>
                  {faq.lang === 'fr' ? 'FR' : 'EN'}
                </Badge>
                {isLeaf && <Badge variant="success">Réponse finale</Badge>}
                {!isLeaf && hasChildren && (
                  <Badge variant="outline">{faq.children!.length} sous-élément(s)</Badge>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {!isLeaf && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onAddChild(faq.id)}
                  title="Ajouter sous-catégorie"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(faq)}
                title="Modifier"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(faq.id)}
                title="Supprimer"
              >
                <Trash2 className="h-4 w-4 text-red-600" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {isExpanded && hasChildren && (
        <div className="mt-2">
          {faq.children!.map((child) => (
            <FaqTreeItem
              key={child.id}
              faq={child}
              level={level + 1}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddChild={onAddChild}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function FaqsPage() {
  const [selectedLang, setSelectedLang] = useState<string>('');
  const { data: faqs, isLoading } = useFaqTree(selectedLang || undefined);
  const deleteFaq = useDeleteFaq();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFaq, setSelectedFaq] = useState<Faq | null>(null);
  const [parentId, setParentId] = useState<string | null>(null);

  const handleEdit = (faq: Faq) => {
    setSelectedFaq(faq);
    setParentId(null);
    setIsModalOpen(true);
  };

  const handleAddChild = (parentFaqId: string) => {
    setSelectedFaq(null);
    setParentId(parentFaqId);
    setIsModalOpen(true);
  };

  const handleAddRoot = () => {
    setSelectedFaq(null);
    setParentId(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet élément FAQ ?')) {
      try {
        await deleteFaq.mutateAsync(id);
      } catch (error: any) {
        alert(error.response?.data?.message || 'Erreur lors de la suppression');
      }
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedFaq(null);
    setParentId(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-lg text-gray-500">Chargement des FAQs...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">FAQ - Questions Fréquentes</h1>
          <p className="text-gray-500 mt-1">
            Gestion arborescente des questions avec catégories et sous-catégories
          </p>
        </div>
        <Button onClick={handleAddRoot}>
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle Catégorie Principale
        </Button>
      </div>

      <div className="flex gap-2">
        <Button
          variant={selectedLang === '' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedLang('')}
        >
          Toutes les langues
        </Button>
        <Button
          variant={selectedLang === 'fr' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedLang('fr')}
        >
          🇫🇷 Français
        </Button>
        <Button
          variant={selectedLang === 'en' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedLang('en')}
        >
          🇬🇧 English
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Arborescence FAQ</CardTitle>
        </CardHeader>
        <CardContent>
          {!faqs || faqs.length === 0 ? (
            <div className="text-center py-12">
              <FileQuestion className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Aucune FAQ trouvée</p>
              <Button className="mt-4" onClick={handleAddRoot}>
                Créer votre première catégorie
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {faqs.map((faq) => (
                <FaqTreeItem
                  key={faq.id}
                  faq={faq}
                  level={0}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onAddChild={handleAddChild}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <FaqFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        faq={selectedFaq}
        parentId={parentId}
      />
    </div>
  );
}
