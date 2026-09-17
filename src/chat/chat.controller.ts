import { Body, Controller, Get, Post, Req, Res } from "@nestjs/common";
import type { Request, Response } from "express";
import { randomUUID } from "crypto";
import { ChatService } from "./chat.service";
import { ChatSseHub } from "./chat-sse.hub";
import { CreateChatMessageDto } from "./dto/create-chat-message.dto";

type AuthRequest = Request & {
  user: { id: string; name: string; email: string };
};

@Controller("api/chat")
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly sseHub: ChatSseHub,
  ) {}

  @Get("messages")
  listMessages() {
    return this.chatService.listMessage();
  }

  @Post("messages")
  createMessage(@Req() req: AuthRequest, @Body() dto: CreateChatMessageDto) {
    return this.chatService.createMessage(req.user, dto.text);
  }

  @Get("sse")
  stream(@Req() req: AuthRequest, @Res() res: Response) {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");
    res.flushHeaders?.();

    const connectionId = randomUUID();
    this.sseHub.add(connectionId, res);
    this.sseHub.send(
      res,
      {
        message: "Connected to chat",
        connectionCount: this.sseHub.count(),
      },
      "connected",
    );

    const cleanup = () => this.sseHub.remove(connectionId);
    req.on("close", cleanup);
    req.on("close", cleanup);
  }
}
