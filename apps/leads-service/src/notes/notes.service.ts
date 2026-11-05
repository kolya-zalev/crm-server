import { Injectable, NotFoundException } from "@nestjs/common";
import type {
  CreateNotePayload,
  LeadIdPayload,
  NoteDto,
  OkResponse,
  RemoveNotePayload,
} from "@app/contracts";
import { PrismaService } from "../prisma/prisma.service";
import { toNoteDto } from "../leads/leads.mapper";

@Injectable()
export class NotesService {
  constructor(private readonly prisma: PrismaService) {}

  async findByLead({ leadId }: LeadIdPayload): Promise<NoteDto[]> {
    const notes = await this.prisma.note.findMany({
      where: { leadId },
      orderBy: { createdAt: "desc" },
    });
    return notes.map(toNoteDto);
  }

  async create({ actor, leadId, text }: CreateNotePayload): Promise<NoteDto> {
    const lead = await this.prisma.lead.findUnique({
      where: { id: leadId },
      select: { id: true },
    });
    if (!lead) throw new NotFoundException(`Lead ${leadId} not found`);

    const [note] = await this.prisma.$transaction([
      this.prisma.note.create({
        data: { leadId, text },
      }),
      this.prisma.activity.create({
        data: {
          leadId,
          type: "note_added",
          description: "Note added",
          userId: actor.id,
          userName: actor.name,
        },
      }),
    ]);

    return toNoteDto(note);
  }

  async remove({
    actor,
    leadId,
    noteId,
  }: RemoveNotePayload): Promise<OkResponse> {
    const note = await this.prisma.note.findFirst({
      where: { id: noteId, leadId },
    });
    if (!note) throw new NotFoundException(`Note ${noteId} not found`);

    await this.prisma.$transaction([
      this.prisma.note.delete({ where: { id: noteId } }),
      this.prisma.activity.create({
        data: {
          leadId,
          type: "note_deleted",
          description: "Note deleted",
          userId: actor.id,
          userName: actor.name,
        },
      }),
    ]);

    return { ok: true };
  }
}
