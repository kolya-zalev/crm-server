import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { InviteMemberDto } from './dto/invite-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { TeamService } from './team.service';

@Controller('api/team')
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  @Get('members')
  findAll() {
    return this.teamService.findAll();
  }

  @Post('invite')
  @HttpCode(201)
  invite(@Body() dto: InviteMemberDto) {
    return this.teamService.invite(dto);
  }

  @Patch('members/:id')
  update(@Param('id') id: string, @Body() dto: UpdateMemberDto) {
    return this.teamService.update(id, dto);
  }
}
