import { Body, Controller, Get, Param, Patch, Post, Request } from '@nestjs/common';
import { Role } from '@prisma/client';
import { Roles } from 'src/auth/roles.decorator';
import { InviteDto } from './dto/invite.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { TeamService } from './team.service';

type AuthRequest = {
  user: {
    id: string;
    workspaceId: string;
  };
};

@Controller('api/team')
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  @Get('members')
  @Roles(Role.admin, Role.manager)
  getMembers(@Request() req: AuthRequest) {
    return this.teamService.getMembers(req.user.workspaceId);
  }

  @Post('invite')
  @Roles(Role.admin, Role.manager)
  invite(@Body() dto: InviteDto, @Request() req: AuthRequest) {
    return this.teamService.invite(dto, req.user);
  }

  @Patch('members/:id')
  @Roles(Role.admin)
  updateMember(
    @Param('id') id: string,
    @Body() dto: UpdateMemberDto,
    @Request() req: AuthRequest,
  ) {
    return this.teamService.updateMember(id, dto, req.user);
  }
}
