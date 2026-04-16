import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerOrder } from '../database/entity/Order/CustomerOrder.entity';
import { WebappUser } from '../database/entity/WebappUser/WebappUser.entity';
import { CheckoutService } from '../service/Checkout/Checkout.service';
import { InvoiceModule } from './Invoice.module';
import { CartModule } from './Cart.module';
import { SyncModule } from './Sync.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([CustomerOrder, WebappUser]),
        InvoiceModule,
        CartModule,
        SyncModule,
    ],
    providers: [CheckoutService],
    exports: [CheckoutService],
})
export class CheckoutModule { }
