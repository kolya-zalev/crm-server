import { IsString, MaxLength } from "class-validator";

export class CreateChatMessageDto {
  @IsString()
  @MaxLength(2000)
  text: string;
}
