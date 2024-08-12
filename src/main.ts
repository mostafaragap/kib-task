/* eslint-disable */

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Set security-related HTTP headers to protect against XSS, clickjacking, etc.
  app.use(helmet());

  // Create and apply rate limiter middleware to prevent DDoS attacks
  const rateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
  });
  app.use(rateLimiter);

  // Set up Swagger documentation
  const config = new DocumentBuilder()
  .setTitle('Movie API')
  .setDescription('API documentation for the Movie application')
  .setVersion('1.0')
  .addBearerAuth() // If you're using JWT or any other auth mechanism
  .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  
  // Apply global validation pipe to sanitize and validate input
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Automatically remove non-whitelisted properties
    forbidNonWhitelisted: true, // Throw an error if non-whitelisted properties are present
    transform: true, // Automatically transform payloads to DTO instances
  }))

  // Start the server
  await app.listen(3000);
}
bootstrap();
