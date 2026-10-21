import "dotenv/config";
import { NestFactory } from "@nestjs/core";
import { MicroserviceOptions, Transport } from "@nestjs/microservices";
import {
  USERS_SERVICE_DEFAULT_PORT,
  USERS_SERVICE_PORT,
} from "@app/contracts";
import { UsersServiceModule } from "./users-service.module";
import { HttpToRpcExceptionFilter } from "./common/http-to-rpc.filter";

async function bootstrap() {
  const port =
    Number(process.env[USERS_SERVICE_PORT]) || USERS_SERVICE_DEFAULT_PORT;

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    UsersServiceModule,
    {
      transport: Transport.TCP,
      options: { host: "0.0.0.0", port },
    },
  );

  // ошибки сервисов (401, 404, ...) → объект, понятный BFF
  app.useGlobalFilters(new HttpToRpcExceptionFilter());

  await app.listen();
  console.log(`👥 Users service: tcp://localhost:${port}`);
}
bootstrap();
