import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import PDFDocument from 'pdfkit';
import { CustomerOrder } from '../../database/entity/Order/CustomerOrder.entity';
import { OrderMapper } from '../mappers/Order.mapper';
import { CreateOrderDto, OrderResponseDto } from '../dtos/Order/Order.dto';
import { EmailService } from '../Email/Email.service';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(CustomerOrder)
    private readonly repo: Repository<CustomerOrder>,
    private readonly mapper: OrderMapper,
    private readonly emailService: EmailService,
  ) {}

  async findAllByUser(userId: string, page = 1, perPage = 10): Promise<{ data: OrderResponseDto[]; total: number }> {
    const [entities, total] = await this.repo.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * perPage,
      take: perPage,
    });
    return { data: this.mapper.toDtoArray(entities), total };
  }

  async findOne(id: string, userId: string): Promise<OrderResponseDto> {
    const order = await this.repo.findOneBy({ id });
    if (!order) throw new NotFoundException('Commande introuvable');
    if (order.userId !== userId) throw new ForbiddenException('Accès refusé');
    return this.mapper.toDto(order);
  }

  async generateInvoicePdf(id: string, userId: string): Promise<Buffer> {
    const order = await this.repo.findOneBy({ id });
    if (!order) throw new NotFoundException('Commande introuvable');
    if (order.userId !== userId) throw new ForbiddenException('Accès refusé');

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Header
      doc.fontSize(24).text('CYNA', { align: 'center' });
      doc.moveDown(0.5);
      doc.fontSize(14).text(`Facture ${order.ref}`, { align: 'center' });
      doc.moveDown(0.5);
      doc.fontSize(10).text(`Date : ${order.createdAt.toLocaleDateString('fr-FR')}`, { align: 'right' });
      doc.moveDown();

      // Billing address
      if (order.billingAddress) {
        doc.fontSize(12).text('Adresse de facturation :');
        doc.fontSize(10);
        if (order.billingAddress.company) doc.text(order.billingAddress.company);
        doc.text(order.billingAddress.street);
        doc.text(`${order.billingAddress.postalCode} ${order.billingAddress.city}`);
        doc.text(order.billingAddress.country);
        doc.moveDown();
      }

      // Items table
      doc.fontSize(12).text('Détails de la commande :', { underline: true });
      doc.moveDown(0.5);

      const tableTop = doc.y;
      doc.fontSize(10);
      doc.text('Produit', 50, tableTop, { width: 200 });
      doc.text('Qté', 260, tableTop, { width: 50, align: 'center' });
      doc.text('Prix unit.', 320, tableTop, { width: 80, align: 'right' });
      doc.text('Sous-total', 410, tableTop, { width: 80, align: 'right' });

      doc.moveTo(50, tableTop + 15).lineTo(500, tableTop + 15).stroke();

      let y = tableTop + 25;
      for (const item of order.items) {
        doc.text(item.productName, 50, y, { width: 200 });
        doc.text(String(item.quantity), 260, y, { width: 50, align: 'center' });
        doc.text(`${item.unitPrice.toFixed(2)} €`, 320, y, { width: 80, align: 'right' });
        doc.text(`${item.subtotal.toFixed(2)} €`, 410, y, { width: 80, align: 'right' });
        y += 20;
      }

      doc.moveTo(50, y).lineTo(500, y).stroke();
      y += 10;
      doc.fontSize(12).text(`Total : ${Number(order.amount).toFixed(2)} €`, 410, y, { width: 80, align: 'right' });

      doc.moveDown(2);
      doc.fontSize(8).text('CYNA SAS - Tous droits réservés', { align: 'center' });

      doc.end();
    });
  }
}
