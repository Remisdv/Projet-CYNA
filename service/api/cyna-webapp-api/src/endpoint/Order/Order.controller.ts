import { Controller, Get, Param, Query, Headers, Res } from '@nestjs/common';
import { Response } from 'express';
import { OrderService } from '../../service/Order/Order.service';
import { OrderResponseDto } from '../../service/Order/dtos/Order.dto';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) { }

  @Get()
  async findAll(
    @Headers('x-user-id') userId: string,
    @Query('page') page?: string,
    @Query('per_page') perPage?: string,
  ): Promise<{ data: OrderResponseDto[]; total: number }> {
    return this.orderService.findAllByUser(
      userId,
      page ? parseInt(page, 10) : 1,
      perPage ? parseInt(perPage, 10) : 10,
    );
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Headers('x-user-id') userId: string,
  ): Promise<OrderResponseDto> {
    return this.orderService.findOne(id, userId);
  }

  @Get(':id/invoice')
  async getInvoice(
    @Param('id') id: string,
    @Headers('x-user-id') userId: string,
    @Res() res: Response,
  ): Promise<void> {
    const pdfBuffer = await this.orderService.generateInvoicePdf(id, userId);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="facture-${id}.pdf"`,
      'Content-Length': pdfBuffer.length,
    });
    res.end(pdfBuffer);
  }
}
