import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceEntity } from '../../database/entity/service/service.entity';
import { ServiceService } from '../../service/service/service.service';
import { ServiceController } from '../../endpoint/service/service.controller';
import { ServiceRepository } from '../../repository/service/service.repository';
import { ServiceMapper } from '../../service/service/mappers/service.mapper';

@Module({
  imports: [TypeOrmModule.forFeature([ServiceEntity])],
  controllers: [ServiceController],
  providers: [ServiceService, ServiceRepository, ServiceMapper],
  exports: [ServiceService],
})
export class ServiceFeatureModule { }
