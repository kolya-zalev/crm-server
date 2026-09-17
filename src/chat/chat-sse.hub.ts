import { Injectable } from "@nestjs/common";
import type { Response } from "express";

@Injectable()
export class ChatSseHub {
  private readonly clients = new Map<string, Response>();

  add(id: string, res: Response): void {
    this.clients.set(id, res);
  }
  remove(id: string): void {
    this.clients.delete(id);
  }
  count(): number {
    return this.clients.size;
  }
  send(res: Response, data: unknown, eventName?: string): void {
    if (eventName) {
      res.write(`event: ${eventName}\n`);
    }
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  }
  broadcast(data: unknown, eventName?: string): void {
    for (const [id, res] of this.clients.entries()) {
      try {
        this.send(res, data, eventName);
      } catch {
        this.clients.delete(id);
      }
    }
  }
}
