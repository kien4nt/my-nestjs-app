import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common'; 

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

    // Apply the ValidationPipe globally
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Strips properties not defined in DTO
    forbidNonWhitelisted: true, // Throws an error if non-whitelisted properties are present
    transform: true, // Enables automatic transformation of incoming payloads to DTO instances
    // disableErrorMessages: true, // Optional: disable detailed error messages in production
  }));

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
