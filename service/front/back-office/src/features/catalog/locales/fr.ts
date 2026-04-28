export default {
  pageTitle: 'Catégories',
  subtitle: 'Organisez vos services en catégories',
  createButton: 'Nouvelle Catégorie',
  listTitle: 'Liste des Catégories',
  emptyTitle: 'Aucune catégorie trouvée',
  createFirstButton: 'Créer votre première catégorie',
  loading: 'Chargement des catégories...',
  table: {
    nameFr: 'Nom (FR)',
    nameEn: 'Nom (EN)',
    slug: 'Slug',
    status: 'Statut',
    actions: 'Actions',
  },
  status: {
    active: 'Actif',
    inactive: 'Inactif',
  },
  confirmations: {
    delete: 'Êtes-vous sûr de vouloir supprimer cette catégorie ?',
  },
  errors: {
    deleteFailed: 'Erreur lors de la suppression de la catégorie',
  },
  services: {
    pageTitle: 'Services',
    subtitle: 'Gérez votre catalogue de services',
    createButton: 'Nouveau service',
    allCategories: 'Toutes les catégories',
  },
  serviceForm: {
    titleNew: 'Nouveau service',
    titleEdit: 'Modifier le service',
  },
  imageUpload: {
    selectImages: 'Cliquez pour sélectionner des images',
    formatsHint: 'PNG, JPG, GIF, WEBP (max {{max}} images)',
    maxImagesError: 'Vous ne pouvez télécharger que {{max}} images maximum',
    selectAtLeastOne: 'Veuillez sélectionner au moins une image',
    uploadError: 'Erreur lors du téléchargement des images',
    selectedImages: 'Images sélectionnées ({{count}})',
    existingImages: 'Images existantes ({{count}})',
    uploadButton: 'Télécharger',
    uploadingButton: 'Téléchargement...',
    uploadSuccess: '{{count}} image(s) téléchargée(s) avec succès',
    fallbackAlt: 'Image',
  },
} as const;
