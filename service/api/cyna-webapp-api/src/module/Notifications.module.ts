import { Module } from '@nestjs/common';
import { NotificationsController } from '../endpoint/Notifications/Notifications.controller';

@Module({
    controllers: [NotificationsController],
})
export class NotificationsModule { }
