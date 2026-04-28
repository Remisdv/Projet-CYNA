import { Controller, Get, Post, Put, Delete, Body, Param, Headers } from '@nestjs/common';
import { CartService } from '../../service/Cart/Cart.service';
import { AddCartItemDto, UpdateCartItemDto, MergeCartDto } from '../../service/Cart/dtos/Cart.dto';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) { }

  @Get()
  async getCart(@Headers('x-user-id') userId: string) {
    const items = await this.cartService.getCart(userId);
    return { items };
  }

  @Post('items')
  async addItem(@Headers('x-user-id') userId: string, @Body() dto: AddCartItemDto) {
    const item = await this.cartService.addItem(userId, dto);
    return item;
  }

  @Put('items/:id')
  async updateQuantity(
    @Headers('x-user-id') userId: string,
    @Param('id') itemId: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    return this.cartService.updateQuantity(userId, itemId, dto);
  }

  @Delete('items/:id')
  async removeItem(@Headers('x-user-id') userId: string, @Param('id') itemId: string) {
    await this.cartService.removeItem(userId, itemId);
    return { success: true };
  }

  @Delete()
  async clearCart(@Headers('x-user-id') userId: string) {
    await this.cartService.clearCart(userId);
    return { success: true };
  }

  @Post('merge')
  async mergeCart(@Headers('x-user-id') userId: string, @Body() dto: MergeCartDto) {
    const items = await this.cartService.mergeLocalCart(userId, dto);
    return { items };
  }
}
