import { Module } from '@nestjs/common';
import { OrderSyncService } from '../service/Sync/OrderSync.service';

@Module({
    providers: [OrderSyncService],
    exports: [OrderSyncService],
})
export class SyncModule { }
