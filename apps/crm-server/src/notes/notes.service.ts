import { Injectable } from "@nestjs/common";
import { leadsMessages, type Actor, type NoteDto } from "@app/contracts";
import { LeadsClient } from "../leads/leads.client";
import { CreateNoteDto } from "./dto/note.dto";

@Injectable()
export class NotesService {
  constructor(private readonly leads: LeadsClient) {}

  findByLead(leadId: string): Promise<NoteDto[]> {
    return this.leads.send(leadsMessages.notesFindByLead, { leadId });
  }

  create(leadId: string, dto: CreateNoteDto, actor: Actor): Promise<NoteDto> {
    return this.leads.send(leadsMessages.notesCreate, {
      actor,
      leadId,
      text: dto.text,
    });
  }

  async remove(leadId: string, noteId: string, actor: Actor): Promise<void> {
    await this.leads.send(leadsMessages.notesRemove, { actor, leadId, noteId });
  }
}
