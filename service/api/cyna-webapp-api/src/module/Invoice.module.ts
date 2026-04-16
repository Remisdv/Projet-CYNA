import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerOrder } from '../database/entity/Order/CustomerOrder.entity';
import { InvoiceService } from '../service/Invoice/Invoice.service';

@Module({
    imports: [TypeOrmModule.forFeature([CustomerOrder])],
    providers: [InvoiceService],
    exports: [InvoiceService],
})
export class InvoiceModule { }
