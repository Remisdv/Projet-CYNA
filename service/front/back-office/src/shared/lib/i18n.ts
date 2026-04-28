import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import common from '@/locales/fr';
import auth from '@/features/auth/locales/fr';
import catalog from '@/features/catalog/locales/fr';
import commercial from '@/features/commercial/locales/fr';
import content from '@/features/content/locales/fr';
import dashboard from '@/features/dashboard/locales/fr';
import orders from '@/features/orders/locales/fr';
import users from '@/features/users/locales/fr';

void i18n.use(initReactI18next).init({
  lng: 'fr',
  fallbackLng: 'fr',
  defaultNS: 'common',
  resources: {
    fr: {
      common,
      auth,
      catalog,
      commercial,
      content,
      dashboard,
      orders,
      users,
    },
  },
  interpolation: { escapeValue: false },
});

export default i18n;
