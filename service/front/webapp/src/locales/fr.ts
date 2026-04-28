export default {
  app: {
    title: 'CYNA',
    tagline: 'Solutions de Cybersécurité',
    loading: 'Chargement...',
  },
  navigation: {
    home: 'Accueil',
    catalog: 'Catalogue',
    account: 'Mon compte',
    cart: 'Panier',
    support: 'Support',
    login: 'Connexion',
    register: 'Inscription',
    logout: 'Déconnexion',
  },
  actions: {
    save: 'Enregistrer',
    cancel: 'Annuler',
    delete: 'Supprimer',
    edit: 'Modifier',
    confirm: 'Confirmer',
    close: 'Fermer',
    back: 'Retour',
    next: 'Suivant',
    previous: 'Précédent',
    submit: 'Valider',
  },
  status: {
    loading: 'Chargement...',
    error: 'Erreur',
    success: 'Succès',
  },
  errors: {
    generic: 'Une erreur est survenue',
    network: 'Erreur de connexion',
    notFound: 'Introuvable',
  },
} as const;
