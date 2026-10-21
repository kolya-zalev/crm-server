import "dotenv/config";

// MAIN.TS — точка входа сервера.
//
// CORS — разрешает запросы с localhost:3000 (Next.js)
// ValidationPipe — автоматическая валидация через class-validator
// Swagger — документация API на /api/docs

import { ValidationPipe } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";
import { NestFactory } from "@nestjs/core";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS — без этого браузер заблокирует запросы между портами
  app.enableCors({
    origin: "http://localhost:3000",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
  });

  // Валидация — автоматически проверяет body через DTO
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // отрезать неизвестные поля
      forbidNonWhitelisted: true, // ошибка если неизвестное поле
      transform: true, // автопреобразование типов
    }),
  );

  // Swagger UI на /api/docs
  const config = new DocumentBuilder()
    .setTitle("CRM API")
    .setDescription("Leads, Notes, Activities, Tasks")
    .setVersion("1.0")
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api/docs", app, document);

  const port = Number(process.env.PORT) || 3001;
  await app.listen(port);
  console.log(`🚀 Server: http://localhost:${port}`);
  console.log(`📖 Swagger: http://localhost:${port}/api/docs`);
}
bootstrap();
