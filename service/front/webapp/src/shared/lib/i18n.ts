import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import commonFr from '@/locales/fr';
import accountFr from '@/features/account/locales/fr';
import authFr from '@/features/auth/locales/fr';
import cartFr from '@/features/cart/locales/fr';
import catalogFr from '@/features/catalog/locales/fr';
import checkoutFr from '@/features/checkout/locales/fr';
import homeFr from '@/features/home/locales/fr';
import ordersFr from '@/features/orders/locales/fr';
import supportFr from '@/features/support/locales/fr';

i18n.use(initReactI18next).init({
  resources: {
    fr: {
      common: commonFr,
      account: accountFr,
      auth: authFr,
      cart: cartFr,
      catalog: catalogFr,
      checkout: checkoutFr,
      home: homeFr,
      orders: ordersFr,
      support: supportFr,
    },
  },
  lng: 'fr',
  fallbackLng: 'fr',
  defaultNS: 'common',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
