import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Put,
  Req,
  Res,
} from "@nestjs/common";
import type { Request, Response } from "express";
import { randomUUID } from "crypto";
import { CurrentUser, type Actor } from "../auth/current-user.decorator";
import { NotificationsService } from "./notifications.service";
import { NotificationsSseHub } from "./notifications-sse.hub";
import {
  notificationHeartbeatMs,
  notificationSseEvents,
} from "./notifications.constants";

@Controller("/api/notifications")
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly sseHub: NotificationsSseHub,
  ) {}

  @Get()
  list(@CurrentUser() actor: Actor) {
    return this.notificationsService.listForUser(actor.id);
  }

  @Get("sse")
  stream(
    @Req() req: Request,
    @Res() res: Response,
    @CurrentUser() actor: Actor,
  ): void {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");
    res.flushHeaders?.();

    const connectionId = randomUUID();
    this.sseHub.add(actor.id, connectionId, res);
    this.sseHub.send(
      res,
      { message: "Connected to notifications" },
      notificationSseEvents.conected,
    );
    const heartbeat = setInterval(() => {
      this.sseHub.ping(res);
    }, notificationHeartbeatMs);
    req.on("close", () => {
      clearInterval(heartbeat);
      this.sseHub.remove(actor.id, connectionId);
    });
  }
  @Put("read-all")
  markAllAsRead(@CurrentUser() actor: Actor) {
    return this.notificationsService.markAllAsRead(actor.id);
  }
  @Delete()
  markAllDetele(@CurrentUser() actor: Actor) {
    return this.notificationsService.markAllDelete(actor.id);
  }
  @Put(":id/read")
  markAsRead(@Param("id") id: string, @CurrentUser() actor: Actor) {
    return this.notificationsService.markAsRead(actor.id, id);
  }
}
