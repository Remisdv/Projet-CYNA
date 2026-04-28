import { useState } from 'react';
import {
  useCarouselItems,
  useDeleteCarouselItem,
  CarouselItem,
} from '../hooks/useCarousel';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/Table';
import { Plus, Edit, Trash2, Image } from 'lucide-react';
import CarouselFormModal from '../components/CarouselFormModal';

export default function CarouselPage() {
  const { data: items, isLoading } = useCarouselItems();
  const deleteItem = useDeleteCarouselItem();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<CarouselItem | null>(null);

  const handleEdit = (item: CarouselItem) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet item ?')) {
      try {
        await deleteItem.mutateAsync(id);
      } catch (error) {
        alert("Erreur lors de la suppression de l'item");
      }
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-lg text-gray-500">Chargement du carousel...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Carousel</h1>
          <p className="text-gray-500 mt-1">
            Gérez les slides du carousel d'accueil
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nouveau Slide
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Slides du Carousel</CardTitle>
        </CardHeader>
        <CardContent>
          {!items || items.length === 0 ? (
            <div className="text-center py-12">
              <Image className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Aucun slide trouvé</p>
              <Button className="mt-4" onClick={() => setIsModalOpen(true)}>
                Créer votre premier slide
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Titre</TableHead>
                  <TableHead>Texte</TableHead>
                  <TableHead>Lien</TableHead>
                  <TableHead>Ordre</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.title}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {item.text}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {item.link}
                    </TableCell>
                    <TableCell>{item.order}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(item)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(item.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <CarouselFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        item={selectedItem}
      />
    </div>
  );
}
