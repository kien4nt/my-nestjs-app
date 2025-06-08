import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Apply the ValidationPipe globally
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Strips properties not defined in DTO
    forbidNonWhitelisted: true, // Throws an error if non-whitelisted properties are present
    transform: true, // Enables automatic transformation of incoming payloads to DTO instances
    // disableErrorMessages: true, // Optional: disable detailed error messages in production
  }));

  // Swagger config setup
  const config = new DocumentBuilder()
    .setTitle('My API')           // API title
    .setDescription('API docs')   // Description
    .setVersion('1.0')            // API version
    // .addBearerAuth()            // Uncomment if using JWT Bearer Auth
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document); // 'api' is the path where Swagger UI will be available


  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
