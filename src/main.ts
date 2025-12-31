import { NestFactory } from '@nestjs/core';
import { AppModule } from '@modules/app.module';
import * as dotenv from 'dotenv';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { GlobalExceptionFilter } from '@common/filters/global-exception.filter';
import { ValidationError } from './common/exceptions';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });

  // Enable CORS
  app.enableCors();

  // Global exception filter
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      exceptionFactory: (errors) => {
        const constraints = errors[0].constraints;
        let message = 'Validation failed: ';
        if (constraints) {
          message += Object.values(constraints)[0];
        }
        return new ValidationError(message);
      },
    }),
  );

  // Swagger documentation setup
  const config = new DocumentBuilder()
    .setTitle('Employee Management API')
    .setDescription('NestJS CRUD API for managing employees and departments with DrizzleORM')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('Auth', 'Authentication endpoints')
    .addTag('Employees', 'Employee management endpoints')
    .addTag('Departments', 'Department management endpoints')
    .addTag('Users', 'User management endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // Custom tag sorting: Auth first, then alphabetical
  if (document.tags) {
    document.tags.sort((a, b) => {
      if (a.name === 'Auth') return -1;
      if (b.name === 'Auth') return 1;
      return a.name.localeCompare(b.name);
    });
  }

  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`Swagger documentation: http://localhost:${port}/api`);
}

bootstrap();
