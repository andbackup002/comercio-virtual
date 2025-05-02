import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import compression from 'compression';
import helmet from 'helmet';
import { AppModule } from './app.module';

/**
 * Função principal para inicialização do API Gateway
 * Configura middlewares globais, documentação e segurança
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Configuração de segurança básica
  app.use(helmet());
  
  // Compressão de resposta
  app.use(compression());
  
  // Validação global de DTOs
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  }));

  // Configuração do CORS
  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
  });

  // Configuração do Swagger
  const config = new DocumentBuilder()
    .setTitle('E-Commerce API Gateway')
    .setDescription('API Gateway para o sistema de e-commerce')
    .setVersion('1.0')
    .addTag('auth', 'Endpoints de autenticação')
    .addTag('products', 'Endpoints de produtos')
    .addTag('cart', 'Endpoints do carrinho')
    .addTag('orders', 'Endpoints de pedidos')
    .addTag('payments', 'Endpoints de pagamentos')
    .addTag('notifications', 'Endpoints de notificações')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Inicialização do servidor
  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`API Gateway rodando na porta ${port}`);
  console.log(`Documentação Swagger disponível em: http://localhost:${port}/api`);
}

bootstrap();