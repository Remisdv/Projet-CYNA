import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../database/entity/User/User.entity';
import { BoAuthService } from '../../service/auth/bo-auth.service';
import { BoAuthController } from '../../endpoint/auth/bo-auth.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [BoAuthController],
  providers: [BoAuthService],
  exports: [BoAuthService],
})
export class BoAuthModule {}
