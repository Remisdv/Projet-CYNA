import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthModule } from './module/health.module';
import { TextePromotionnelModule } from './module/TextePromotionnel.module';
import { UserModule } from './module/User.module';
import { BoAuthModule } from './module/BoAuth.module';
import { CategoryModule } from './module/Category.module';
import { CarouselModule } from './module/Carousel.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      autoLoadEntities: true,
      synchronize: process.env.NODE_ENV !== 'production',
    }),
    HealthModule,
    TextePromotionnelModule,
    UserModule,
    BoAuthModule,
    CategoryModule,
    CarouselModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
