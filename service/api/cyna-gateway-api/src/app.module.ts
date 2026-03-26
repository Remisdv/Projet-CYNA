import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthModule } from './module/health.module';
import { ProxyModule } from './module/proxy.module';
import {
  LoggerMiddleware,
  RateLimitMiddleware,
  HelmetMiddleware,
  RequestIdMiddleware,
  CompressionMiddleware,
  JwtAuthGuard,
  RolesGuard,
} from './common';

import { BoAuthModule } from './module/bo-auth.module';

@Module({
  imports: [HealthModule, ProxyModule, BoAuthModule],
  controllers: [AppController],
  providers: [
    AppService,
    // Order matters: JwtAuthGuard must run before RolesGuard
    // because RolesGuard relies on the user object attached by JwtAuthGuard
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(
        // Order matters for middleware:
        // 1. RequestId: Generates ID for tracking (needed by Logger)
        // 2. Helmet: Security headers
        // 3. Logger: Logs request (uses ID from RequestId)
        // 4. RateLimit: Limits requests
        // 5. Compression: Compresses response
        RequestIdMiddleware,
        HelmetMiddleware,
        LoggerMiddleware,
        RateLimitMiddleware,
        CompressionMiddleware,
      )
      .forRoutes('*');
  }
}
