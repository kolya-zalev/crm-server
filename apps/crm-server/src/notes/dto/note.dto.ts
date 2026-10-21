import { IsString, MinLength } from 'class-validator';

export class CreateNoteDto {
  @IsString()
  @MinLength(1, { message: 'Text is required' })
  text: string;
}
