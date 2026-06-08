import { Body, Controller, Delete, Get, HttpCode, Param, Post } from '@nestjs/common';
import { NotesService } from './notes.service';
import { CreateNoteDto } from './dto/note.dto';

@Controller('api/leads/:id/notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Get()
  findByLead(@Param('id') leadId: string) {
    return this.notesService.findByLead(leadId);
  }

  @Post()
  create(@Param('id') leadId: string, @Body() dto: CreateNoteDto) {
    return this.notesService.create(leadId, dto);
  }

  @Delete(':noteId')
  @HttpCode(204)
  remove(@Param('id') leadId: string, @Param('noteId') noteId: string) {
    return this.notesService.remove(leadId, noteId);
  }
}
