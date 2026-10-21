import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { ChatSseHub } from "./chat-sse.hub";

export type ChatMessageDto = {
  id: string;
  text: string;
  authorId: string;
  authorName: string;
  createdAt: string;
};
type AuthUser = { id: string; name: string; email: string };

@Injectable()
export class ChatService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly sseHub: ChatSseHub,
  ) {}

  private toDto(row: {
    id: string;
    text: string;
    authorId: string;
    authorName: string;
    createdAt: Date;
  }): ChatMessageDto {
    return {
      id: row.id,
      text: row.text,
      authorId: row.authorId,
      authorName: row.authorName,
      createdAt: row.createdAt.toISOString(),
    };
  }

  async listMessage(): Promise<ChatMessageDto[]> {
    const rows = await this.prisma.chatMessage.findMany({
      orderBy: { createdAt: "asc" },
    });
    return rows.map((row) => this.toDto(row));
  }

  async createMessage(
    user: AuthUser,
    rawText: string,
  ): Promise<ChatMessageDto> {
    const text = rawText.trim();
    if (!text) {
      throw new BadRequestException("Text is required");
    }
    if (text.length > 2000) {
      throw new BadRequestException("Text must be at most 2000 characters");
    }
    const row = await this.prisma.chatMessage.create({
      data: {
        text,
        authorId: user.id,
        authorName: user.name?.trim() || user.email || "User",
      },
    });
    const dto = this.toDto(row);
    this.sseHub.broadcast(dto, "message");
    return dto;
  }
}
