import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  const config = new DocumentBuilder()
    .setTitle('CYNA Gateway API')
    .setDescription('API Gateway pour les services CYNA - Health checks et routage')
    .setVersion('1.0')
    .addTag('Gateway', 'Endpoints du Gateway')
    .addTag('Health', 'Health checks de tous les services')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`CYNA Gateway API is running on port ${port}`);
  console.log(`Swagger UI available at http://localhost:${port}/api`);
}
bootstrap();
