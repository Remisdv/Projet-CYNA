import { useState } from 'react';
import {
  useCategories,
  useDeleteCategory,
  Category,
} from './hooks/useCategories';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/Table';
import { Plus, Edit, Trash2, FolderOpen } from 'lucide-react';
import CategoryFormModal from './CategoryFormModal';

export default function CategoriesPage() {
  const { data: categories, isLoading } = useCategories();
  const deleteCategory = useDeleteCategory();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) {
      try {
        await deleteCategory.mutateAsync(id);
      } catch (error) {
        alert('Erreur lors de la suppression de la catégorie');
      }
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCategory(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-lg text-gray-500">
          Chargement des catégories...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Catégories</h1>
          <p className="text-gray-500 mt-1">
            Organisez vos services en catégories
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle Catégorie
        </Button>
      </div>

      {/* Categories Table */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des Catégories</CardTitle>
        </CardHeader>
        <CardContent>
          {!categories || categories.length === 0 ? (
            <div className="text-center py-12">
              <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Aucune catégorie trouvée</p>
              <Button className="mt-4" onClick={() => setIsModalOpen(true)}>
                Créer votre première catégorie
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom (FR)</TableHead>
                  <TableHead>Nom (EN)</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => {
                  const frTranslation = category.translations.find(
                    (t) => t.lang.toLowerCase() === 'fr'
                  );
                  const enTranslation = category.translations.find(
                    (t) => t.lang.toLowerCase() === 'en'
                  );

                  return (
                    <TableRow key={category.id}>
                      <TableCell className="font-medium">
                        {frTranslation?.name || '-'}
                      </TableCell>
                      <TableCell>{enTranslation?.name || '-'}</TableCell>
                      <TableCell>
                        <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                          {category.slug}
                        </code>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={category.isActive ? 'success' : 'destructive'}
                        >
                          {category.isActive ? 'Actif' : 'Inactif'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(category)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(category.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Category Form Modal */}
      <CategoryFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        category={selectedCategory}
      />
    </div>
  );
}
