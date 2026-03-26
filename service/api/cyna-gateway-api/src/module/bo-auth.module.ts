import { Module } from '@nestjs/common';
import { BoAuthService } from '../service/bo-auth/bo-auth.service';
import { BoAuthController } from '../endpoint/bo-auth/bo-auth.controller';

@Module({
  controllers: [BoAuthController],
  providers: [BoAuthService],
  exports: [BoAuthService],
})
export class BoAuthModule {}
