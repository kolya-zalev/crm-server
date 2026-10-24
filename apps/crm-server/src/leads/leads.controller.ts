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
import { CreateLeadDto, UpdateLeadDto } from "./dto/lead.dto";
import { CurrentUser, type Actor } from "../auth/current-user.decorator";
import { RequirePermissions } from "../auth/permissions.decorator";
import { LeadsFacade } from "./leads.facade";
@Controller("api/leads")
export class LeadsController {
  constructor(private readonly leadsService: LeadsFacade) {}

  @Get()
  @RequirePermissions("lead:read")
  findAll() {
    return this.leadsService.findAll();
  }

  @Get(":id")
  @RequirePermissions("lead:read")
  findOne(@Param("id") id: string) {
    return this.leadsService.findOne(id);
  }

  @Post()
  @RequirePermissions("lead:create")
  create(@Body() dto: CreateLeadDto, @CurrentUser() actor: Actor) {
    return this.leadsService.create(dto, actor);
  }

  @Put(":id")
  @RequirePermissions("lead:update-status")
  update(
    @Param("id") id: string,
    @Body() dto: UpdateLeadDto,
    @CurrentUser() actor: Actor,
  ) {
    return this.leadsService.update(id, dto, actor);
  }

  @Delete(":id")
  @RequirePermissions("lead:delete")
  @HttpCode(204)
  remove(@Param("id") id: string) {
    return this.leadsService.remove(id);
  }
}
