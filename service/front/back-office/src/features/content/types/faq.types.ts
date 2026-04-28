export interface Faq {
  id: string;
  parentId: string | null;
  question: string;
  answer: string;
  lang: string;
  order: number;
  children?: Faq[];
}

export interface CreateFaqInput {
  parentId?: string | null;
  question: string;
  answer?: string;
  lang: string;
  order?: number;
}
