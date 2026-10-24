import "dotenv/config";
import { NestFactory } from "@nestjs/core";
import { MicroserviceOptions, Transport } from "@nestjs/microservices";
import { LEADS_SERVICE_DEFAULT_PORT, LEADS_SERVICE_PORT } from "@app/contracts";
import { LeadsServiceModule } from "./leads-service.module";
import { HttpToRpcExceptionFilter } from "@app/common";
async function bootstrap() {
  const port =
    Number(process.env[LEADS_SERVICE_PORT]) || LEADS_SERVICE_DEFAULT_PORT;

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    LeadsServiceModule,
    {
      transport: Transport.TCP,
      options: { host: "0.0.0.0", port },
    },
  );

  app.useGlobalFilters(new HttpToRpcExceptionFilter());

  await app.listen();
  console.log(`Leads service: tcp://localhost:${port}`);
}
bootstrap();
