import "dotenv/config";

// MAIN.TS — точка входа сервера.
//
// CORS — разрешает запросы с localhost:3000 (Next.js)
// Better Auth — /api/auth/* (вход, регистрация, сессия)
// ValidationPipe — автоматическая валидация через class-validator
// Swagger — документация API на /api/docs

import { ValidationPipe } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { toNodeHandler } from "better-auth/node";
import { AppModule } from "./app.module";
import { NestFactory } from "@nestjs/core";
import { AUTH, type Auth } from "./auth/better-auth";

async function bootstrap() {
  // bodyParser: false — парсеры тела подключаем сами, ПОСЛЕ Better Auth (см. ниже)
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bodyParser: false,
  });

  // CORS — без этого браузер заблокирует запросы между портами.
  // credentials: true — чтобы браузер слал и принимал cookie сессии
  app.enableCors({
    origin: process.env.FRONTEND_URL ?? "http://localhost:3000",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
  });

  // Better Auth: /api/auth/* (sign-up, sign-in, get-session, sign-out…).
  // Он сам читает тело запроса, поэтому стоит до express.json
  const auth = app.get<Auth>(AUTH);
  app.getHttpAdapter().getInstance().all("/api/auth/*", toNodeHandler(auth));

  // те же парсеры, что Nest включает по умолчанию
  app.useBodyParser("json");
  app.useBodyParser("urlencoded", { extended: true });

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
