import { Logger } from "@nestjs/common";
import { OnWorkerEvent, Processor, WorkerHost } from "@nestjs/bullmq";
import { NamesQueues } from "../queues/queues.constants";
import { NotificationsService } from "./notifications.service";
import { Job } from "bullmq";
import { notificationsJobs } from "./notifications.constants";

@Processor(NamesQueues.notifications)
export class NotificationsProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationsProcessor.name);

  constructor(private readonly notifications: NotificationsService) {
    super();
  }

  async process(job: Job) {
    switch (job.name) {
      case notificationsJobs.leadAssigned:
        return await this.notifications.notifyLeadAssigned(job.data);
      case notificationsJobs.leadClosed:
        return await this.notifications.notifyLeadClosed(job.data);
      case notificationsJobs.leadStatusChanged:
        return await this.notifications.notifyLeadStatusChanged(job.data);
      case notificationsJobs.taskCreated:
        return await this.notifications.notifyTaskCreated(job.data);
      case notificationsJobs.taskDeleted:
        return await this.notifications.notifyTaskDeleted(job.data);
      default:
        throw new Error(`Unknown job ${job.name}`);
    }
  }

  @OnWorkerEvent("failed")
  onFailed(job: Job, error: Error) {
    this.logger.error(
      `Job ${job.id} (${job.name}) failed: ${error.message}`,
      error.stack,
    );
  }
}
