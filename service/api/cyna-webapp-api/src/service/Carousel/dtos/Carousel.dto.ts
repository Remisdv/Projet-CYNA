export class CarouselImageDto {
    url: string;
    altText: string;
}

export class CarouselItemDto {
    id: string;
    image: CarouselImageDto;
    title: string;
    text: string;
    link: string;
    order: number;
}
