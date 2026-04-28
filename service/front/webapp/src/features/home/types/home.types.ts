export interface Advertisement {
  id: string;
  textFr?: string;
  textEn?: string;
  isActive?: boolean;
}

export interface CarouselSlide {
  id: string;
  titre?: string;
  description?: string;
  image?: string;
  lien?: string;
  ordre?: number;
}
