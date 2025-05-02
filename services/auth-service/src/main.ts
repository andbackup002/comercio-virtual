import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Configuração global de validação de DTOs
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));

  // Porta do serviço de autenticação
  const port = process.env.AUTH_SERVICE_PORT || 3001;
  
  await app.listen(port);
  console.log(`Auth service running on port ${port}`);
}

bootstrap();