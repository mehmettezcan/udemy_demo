import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Udemy Demo API')
    .setDescription('User/Instructor/Admin + Purchase/Payment + Live Lesson Matching')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);

  const logger = new Logger('UdemyDemo');
  app.use((req: any, _res: any, next: any) => {
    logger.log(`${req.method} ${req.url}`);
    next();
  });

  await app.listen(3000);
}

bootstrap();
