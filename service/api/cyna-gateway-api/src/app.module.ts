import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthModule } from './module/health.module';
import {
  LoggerMiddleware,
  RateLimitMiddleware,
  HelmetMiddleware,
  RequestIdMiddleware,
  CompressionMiddleware,
  JwtAuthGuard,
  RolesGuard,
} from './common';

@Module({
  imports: [HealthModule],
  controllers: [AppController],
  providers: [
    AppService,
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
        RequestIdMiddleware,
        HelmetMiddleware,
        LoggerMiddleware,
        RateLimitMiddleware,
        CompressionMiddleware,
      )
      .forRoutes('*');
  }
}
