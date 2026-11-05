import { Injectable } from "@nestjs/common";
import type { Response } from "express";

@Injectable()
export class NotificationsSseHub {
  private readonly clients = new Map<string, Map<string, Response>>();

  add(userId: string, connectionId: string, res: Response): void {
    const connections = this.clients.get(userId);

    if (connections) {
      connections.set(connectionId, res);
      return;
    }
    this.clients.set(userId, new Map([[connectionId, res]]));
  }
  remove(userId: string, connectionId: string): void {
    const connections = this.clients.get(userId);
    if (!connections) return;
    connections.delete(connectionId);
    if (connections.size === 0) {
      this.clients.delete(userId);
    }
  }
  send(res: Response, data: unknown, eventName?: string): void {
    if (eventName) {
      res.write(`event: ${eventName}\n`);
    }
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  }
  ping(res: Response): void {
    res.write(" :ping\n\n");
  }
  sendToUser(userId: string, data: unknown, eventName?: string): void {
    const connections = this.clients.get(userId);

    if (!connections) return;
    for (const [connectionId, res] of connections.entries()) {
      try {
        this.send(res, data, eventName);
      } catch {
        this.remove(userId, connectionId);
      }
    }
  }
}
