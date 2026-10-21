import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
} from "@nestjs/common";
import { NotesService } from "./notes.service";
import { CreateNoteDto } from "./dto/note.dto";
import { RequirePermissions } from "../auth/permissions.decorator";

@Controller("api/leads/:id/notes")
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Get()
  @RequirePermissions("lead:read")
  findByLead(@Param("id") leadId: string) {
    return this.notesService.findByLead(leadId);
  }

  @Post()
  create(@Param("id") leadId: string, @Body() dto: CreateNoteDto) {
    return this.notesService.create(leadId, dto);
  }

  @Delete(":noteId")
  @HttpCode(204)
  remove(@Param("id") leadId: string, @Param("noteId") noteId: string) {
    return this.notesService.remove(leadId, noteId);
  }
}
