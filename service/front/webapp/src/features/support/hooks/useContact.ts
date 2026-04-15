import { useMutation } from '@tanstack/react-query';
import api from '../../../services/api';

export interface ContactData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export function useContact() {
  return useMutation({
    mutationFn: async (contactData: ContactData) => {
      const { data } = await api.post('/webapp/contact', contactData);
      return data;
    },
  });
}
