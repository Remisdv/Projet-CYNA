import { apiClient } from '@/shared/lib/apiClient';
import type { ContactData } from '../types/support.types';

export const supportApi = {
  sendContact: async (contactData: ContactData): Promise<unknown> => {
    const { data } = await apiClient.post('/webapp/contact-messages', contactData);
    return data;
  },
};
