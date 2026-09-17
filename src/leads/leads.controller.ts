import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
} from "@nestjs/common";
import { LeadsService } from "./leads.service";
import { CreateLeadDto, UpdateLeadDto } from "./dto/lead.dto";
import { CurrentUser, type Actor } from "src/auth/current-user.decorator";

@Controller("api/leads")
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Get()
  findAll() {
    return this.leadsService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.leadsService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateLeadDto, @CurrentUser() actor: Actor) {
    return this.leadsService.create(dto, actor);
  }

  @Put(":id")
  update(
    @Param("id") id: string,
    @Body() dto: UpdateLeadDto,
    @CurrentUser() actor: Actor,
  ) {
    return this.leadsService.update(id, dto, actor);
  }

  @Delete(":id")
  @HttpCode(204)
  remove(@Param("id") id: string) {
    return this.leadsService.remove(id);
  }
}
