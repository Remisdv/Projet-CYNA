export class SubscriptionResponseDto {
    id: string;
    productId: string;
    productName: string;
    planType: string;
    status: string;
    price: number;
    startDate: Date;
    renewalDate: Date;
    createdAt: Date;
}
