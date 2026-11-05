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
import { CurrentUser, type Actor } from "../auth/current-user.decorator";

@Controller("api/leads/:id/notes")
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Get()
  @RequirePermissions("lead:read")
  findByLead(@Param("id") leadId: string) {
    return this.notesService.findByLead(leadId);
  }

  @Post()
  create(
    @Param("id") leadId: string,
    @Body() dto: CreateNoteDto,
    @CurrentUser() actor: Actor,
  ) {
    return this.notesService.create(leadId, dto, actor);
  }

  @Delete(":noteId")
  @HttpCode(204)
  remove(
    @Param("id") leadId: string,
    @Param("noteId") noteId: string,
    @CurrentUser() actor: Actor,
  ) {
    return this.notesService.remove(leadId, noteId, actor);
  }
}
