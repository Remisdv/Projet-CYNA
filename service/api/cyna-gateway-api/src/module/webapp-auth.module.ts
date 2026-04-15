import { Module } from '@nestjs/common';
import { WebappAuthService } from '../service/webapp-auth/webapp-auth.service';
import { WebappAuthController } from '../endpoint/webapp-auth/webapp-auth.controller';

@Module({
  controllers: [WebappAuthController],
  providers: [WebappAuthService],
  exports: [WebappAuthService],
})
export class WebappAuthModule {}
