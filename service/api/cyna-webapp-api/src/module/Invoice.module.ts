import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerOrder } from '../database/entity/Order/CustomerOrder.entity';
import { InvoiceService } from '../service/Invoice/Invoice.service';
import { CustomerOrderRepository } from '../repository/Order/Order.repository';

@Module({
    imports: [TypeOrmModule.forFeature([CustomerOrder])],
    providers: [InvoiceService, CustomerOrderRepository],
    exports: [InvoiceService],
})
export class InvoiceModule { }
