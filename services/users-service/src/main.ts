import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: 'http://localhost:5173',
    credentials: true,
  });

  console.log('PORT from env:', process.env.PORT);

  await app.listen(process.env.PORT ?? 3009);
}

bootstrap();