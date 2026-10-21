import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateNoteDto } from "./dto/note.dto";

@Injectable()
export class NotesService {
  constructor(private readonly prisma: PrismaService) {}

  async findByLead(leadId: string) {
    return this.prisma.note.findMany({
      where: { leadId },
      orderBy: { createdAt: "desc" },
    });
  }

  async create(leadId: string, dto: CreateNoteDto) {
    const note = await this.prisma.note.create({
      data: {
        leadId,
        text: dto.text,
      },
    });

    await this.prisma.activity.create({
      data: {
        leadId,
        type: "note_added",
        description: "Note added",
      },
    });

    return note;
  }

  async remove(leadId: string, noteId: string): Promise<void> {
    const note = await this.prisma.note.findFirst({
      where: { id: noteId, leadId },
    });
    if (!note) throw new NotFoundException(`Note ${noteId} not found`);

    await this.prisma.note.delete({ where: { id: noteId } });
    await this.prisma.activity.create({
      data: {
        leadId,
        type: "note_deleted",
        description: "Note deleted",
      },
    });
  }
}
