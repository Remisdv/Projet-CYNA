import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceEntity } from '../../database/entity/service/service.entity';
import { ServiceService } from '../../service/service/service.service';
import { ServiceController } from '../../endpoint/service/service.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ServiceEntity])],
  controllers: [ServiceController],
  providers: [ServiceService],
  exports: [ServiceService],
})
export class ServiceFeatureModule {}
