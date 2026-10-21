import { Module } from "@nestjs/common";
import { ChatController } from "./chat.controller";
import { ChatService } from "./chat.service";
import { ChatSseHub } from "./chat-sse.hub";

@Module({
  controllers: [ChatController],
  providers: [ChatService, ChatSseHub],
})
export class ChatModule {}
