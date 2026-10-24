import { Module } from "@nestjs/common";
import { LeadsModule } from "../leads/leads.module";
import { NotesController } from "./notes.controller";
import { NotesService } from "./notes.service";

@Module({
  imports: [LeadsModule],
  controllers: [NotesController],
  providers: [NotesService],
})
export class NotesModule {}
