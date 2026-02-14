import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthModule } from './module/health.module';
import { CarrouselImageModule } from './module/CarrouselImage.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      autoLoadEntities: true,
      synchronize: process.env.NODE_ENV !== 'production',
    }),
    HealthModule,
    CarrouselImageModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
