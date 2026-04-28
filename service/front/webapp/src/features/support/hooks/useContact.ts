import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/shared/lib/apiClient';

export interface ContactData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export function useContact() {
  return useMutation({
    mutationFn: async (contactData: ContactData) => {
      const { data } = await apiClient.post('/webapp/contact', contactData);
      return data;
    },
  });
}
