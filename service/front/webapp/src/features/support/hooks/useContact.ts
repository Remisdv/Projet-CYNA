import { useMutation } from '@tanstack/react-query';
import { supportApi } from '../api/support.api';
import type { ContactData } from '../types/support.types';

export type { ContactData } from '../types/support.types';

export function useContact() {
  return useMutation({
    mutationFn: (contactData: ContactData) => supportApi.sendContact(contactData),
  });
}

