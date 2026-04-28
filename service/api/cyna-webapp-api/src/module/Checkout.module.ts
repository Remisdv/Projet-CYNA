import { Module } from '@nestjs/common';
import { CheckoutService } from '../service/Checkout/Checkout.service';
import { InvoiceModule } from './Invoice.module';
import { CartModule } from './Cart.module';
import { SyncModule } from './Sync.module';
import { OrderModule } from './Order.module';
import { AccountModule } from './Account.module';

@Module({
    imports: [
        OrderModule,
        AccountModule,
        InvoiceModule,
        CartModule,
        SyncModule,
    ],
    providers: [CheckoutService],
    exports: [CheckoutService],
})
export class CheckoutModule { }
