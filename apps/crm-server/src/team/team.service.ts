import { Injectable } from "@nestjs/common";
import { messages, type TeamMember } from "@app/contracts";
import { UsersClient } from "../users/users.client";
import { InviteMemberDto } from "./dto/invite-member.dto";
import { UpdateMemberDto } from "./dto/update-member.dto";

@Injectable()
export class TeamService {
  constructor(private readonly users: UsersClient) {}

  findAll(): Promise<TeamMember[]> {
    return this.users.send(messages.teamFindAll, {});
  }

  invite(dto: InviteMemberDto): Promise<TeamMember> {
    return this.users.send(messages.teamInvite, dto);
  }

  update(id: string, dto: UpdateMemberDto): Promise<TeamMember> {
    return this.users.send(messages.teamUpdate, { id, ...dto });
  }
}
