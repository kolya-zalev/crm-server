import { Module } from "@nestjs/common";
import { NotificationsController } from "./notifications.controller";
import { NotificationsService } from "./notifications.service";
import { NotificationsSseHub } from "./notifications-sse.hub";
import { UsersModule } from "../users/users.module";
import { BullModule } from "@nestjs/bullmq";
import { NamesQueues } from "../queues/queues.constants";
import { NotificationsProducer } from "./notifications.producer";
import { NotificationsProcessor } from "./notifications.processor";
@Module({
  imports: [
    UsersModule,
    BullModule.registerQueue({
      name: NamesQueues.notifications,
      defaultJobOptions: {
        attempts: 8,
        backoff: { type: "exponential", delay: 2000 },
      },
    }),
  ],
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    NotificationsSseHub,
    NotificationsProducer,
    NotificationsProcessor,
  ],
  exports: [NotificationsService, NotificationsProducer],
})
export class NotificationsModule {}
