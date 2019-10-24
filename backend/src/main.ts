import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  let app = await NestFactory.create(AppModule);
  app = app.setGlobalPrefix('/api/v1.0').enableCors();
  await app.listen(3002);
}
bootstrap();
