import { Controller } from "@nestjs/common";
import { MessagePattern, Payload } from "@nestjs/microservices";
import {
  messages,
  type TeamInvitePayload,
  type TeamMember,
  type TeamUpdatePayload,
} from "@app/contracts";
import { TeamService } from "./team.service";

@Controller()
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  @MessagePattern(messages.teamFindAll)
  findAll(): Promise<TeamMember[]> {
    return this.teamService.findAll();
  }

  @MessagePattern(messages.teamInvite)
  invite(@Payload() payload: TeamInvitePayload): Promise<TeamMember> {
    return this.teamService.invite(payload);
  }

  @MessagePattern(messages.teamUpdate)
  update(@Payload() payload: TeamUpdatePayload): Promise<TeamMember> {
    return this.teamService.update(payload);
  }
}
