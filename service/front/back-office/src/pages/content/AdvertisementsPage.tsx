import { useState } from 'react';
import {
  useAdvertisements,
  useDeleteAdvertisement,
  useActivateAdvertisement,
  Advertisement,
} from '../../services/queries';
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
import { Plus, Edit, Trash2, Megaphone, Radio } from 'lucide-react';
import AdvertisementFormModal from './AdvertisementFormModal';

export default function AdvertisementsPage() {
  const { data: ads, isLoading } = useAdvertisements();
  const deleteAd = useDeleteAdvertisement();
  const activateAd = useActivateAdvertisement();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAd, setSelectedAd] = useState<Advertisement | null>(null);

  const handleEdit = (ad: Advertisement) => {
    setSelectedAd(ad);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette publicité ?')) {
      try {
        await deleteAd.mutateAsync(id);
      } catch (error: any) {
        alert(error.response?.data?.message || 'Erreur lors de la suppression');
      }
    }
  };

  const handleActivate = async (id: string) => {
    try {
      await activateAd.mutateAsync(id);
    } catch (error) {
      alert('Erreur lors de l\'activation');
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedAd(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-lg text-gray-500">
          Chargement des publicités...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Publicités</h1>
          <p className="text-gray-500 mt-1">
            Texte défilant sur la page d'accueil • Une seule active à la fois
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle Publicité
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des Publicités</CardTitle>
        </CardHeader>
        <CardContent>
          {!ads || ads.length === 0 ? (
            <div className="text-center py-12">
              <Megaphone className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Aucune publicité trouvée</p>
              <Button className="mt-4" onClick={() => setIsModalOpen(true)}>
                Créer votre première publicité
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Texte Français</TableHead>
                  <TableHead>Texte English</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ads.map((ad) => (
                  <TableRow key={ad.id} className={ad.isActive ? 'bg-green-50' : ''}>
                    <TableCell className="font-medium max-w-md">
                      <div className="truncate">{ad.textFr}</div>
                    </TableCell>
                    <TableCell className="max-w-md">
                      <div className="truncate text-gray-600">{ad.textEn}</div>
                    </TableCell>
                    <TableCell>
                      {ad.isActive ? (
                        <Badge variant="success" className="flex items-center gap-1 w-fit">
                          <Radio className="h-3 w-3" />
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant={ad.isActive ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleActivate(ad.id)}
                          disabled={ad.isActive}
                          className={ad.isActive ? "bg-green-600 hover:bg-green-700" : ""}
                        >
                          {ad.isActive ? "✓ Active" : "Activer"}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(ad)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(ad.id)}
                          disabled={ads.length <= 1}
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

      <AdvertisementFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        advertisement={selectedAd}
      />
    </div>
  );
}
