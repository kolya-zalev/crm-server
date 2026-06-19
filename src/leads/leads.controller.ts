import {
  Body, Controller, Delete, Get, HttpCode, Param, Post, Put,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { Roles } from 'src/auth/roles.decorator';
import { LeadsService } from './leads.service';
import { CreateLeadDto, UpdateLeadDto } from './dto/lead.dto';

@Controller('api/leads')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Get()
  findAll() {
    return this.leadsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.leadsService.findOne(id);
  }

  @Post()
  @Roles(Role.admin, Role.manager, Role.sales)
  create(@Body() dto: CreateLeadDto) {
    return this.leadsService.create(dto);
  }

  @Put(':id')
  @Roles(Role.admin, Role.manager, Role.sales)
  update(@Param('id') id: string, @Body() dto: UpdateLeadDto) {
    return this.leadsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @Roles(Role.admin, Role.manager)
  remove(@Param('id') id: string) {
    return this.leadsService.remove(id);
  }
}
