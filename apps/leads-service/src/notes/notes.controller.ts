import { Controller } from "@nestjs/common";
import { MessagePattern, Payload } from "@nestjs/microservices";
import {
  leadsMessages,
  type CreateNotePayload,
  type LeadIdPayload,
  type NoteDto,
  type OkResponse,
  type RemoveNotePayload,
} from "@app/contracts";
import { NotesService } from "./notes.service";

@Controller()
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @MessagePattern(leadsMessages.notesFindByLead)
  findByLead(@Payload() payload: LeadIdPayload): Promise<NoteDto[]> {
    return this.notesService.findByLead(payload);
  }

  @MessagePattern(leadsMessages.notesCreate)
  create(@Payload() payload: CreateNotePayload): Promise<NoteDto> {
    return this.notesService.create(payload);
  }

  @MessagePattern(leadsMessages.notesRemove)
  remove(@Payload() payload: RemoveNotePayload): Promise<OkResponse> {
    return this.notesService.remove(payload);
  }
}
