export default {
  login: {
    title: 'Admin Login',
    emailLabel: 'Email',
    passwordLabel: 'Password',
    showPasswordAriaLabel: 'Afficher le mot de passe',
    hidePasswordAriaLabel: 'Masquer le mot de passe',
    submitButton: 'Login',
    submitting: 'Connexion...',
    errors: {
      missingRole: 'Rôle manquant dans la réponse du serveur',
      invalidCredentials: 'Email ou mot de passe incorrect',
      emailInvalid: 'Adresse email invalide',
      passwordTooShort: 'Le mot de passe doit contenir au moins 6 caractères',
    },
  },
  twoFactor: {
    title: 'Vérification en deux étapes',
    description: 'Un code à 6 chiffres a été envoyé à',
    codeLabel: 'Code de vérification',
    codePlaceholder: '123456',
    submitButton: 'Vérifier',
    submitting: 'Vérification...',
    resendButton: 'Renvoyer le code',
    resendCountdown: 'Renvoyer le code ({{seconds}}s)',
    resendSuccess: 'Nouveau code envoyé !',
    errors: {
      codeLength: 'Le code doit contenir 6 chiffres',
      invalidCode: 'Code invalide',
      resendFailed: 'Erreur lors du renvoi du code',
    },
  },
} as const;
