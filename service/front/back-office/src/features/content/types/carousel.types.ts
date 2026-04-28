export interface CarouselItem {
  id: string;
  imageId: string;
  title: string;
  text: string;
  link: string;
  order: number;
  image?: {
    id: string;
    url: string;
    altText: string;
  };
}
