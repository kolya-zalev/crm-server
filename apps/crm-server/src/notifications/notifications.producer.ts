import { Injectable } from "@nestjs/common";
import { Queue } from "bullmq";
import { InjectQueue } from "@nestjs/bullmq";
import { NamesQueues } from "../queues/queues.constants";
import { NotificationsService } from "./notifications.service";
import { notificationsJobs } from "./notifications.constants";
@Injectable()
export class NotificationsProducer {
  constructor(
    @InjectQueue(NamesQueues.notifications)
    private readonly notificationsQueue: Queue,
  ) {}
  leadAssigned(
    params: Parameters<NotificationsService["notifyLeadAssigned"]>[0],
  ) {
    return this.notificationsQueue.add(notificationsJobs.leadAssigned, params);
  }
  leadClosed(params: Parameters<NotificationsService["notifyLeadClosed"]>[0]) {
    return this.notificationsQueue.add(notificationsJobs.leadClosed, params);
  }
  leadStatusChanged(
    params: Parameters<NotificationsService["notifyLeadStatusChanged"]>[0],
  ) {
    return this.notificationsQueue.add(
      notificationsJobs.leadStatusChanged,
      params,
    );
  }
  taskCreated(
    params: Parameters<NotificationsService["notifyTaskCreated"]>[0],
  ) {
    return this.notificationsQueue.add(notificationsJobs.taskCreated, params);
  }
  taskDeleted(
    params: Parameters<NotificationsService["notifyTaskDeleted"]>[0],
  ) {
    return this.notificationsQueue.add(notificationsJobs.taskDeleted, params);
  }
}
