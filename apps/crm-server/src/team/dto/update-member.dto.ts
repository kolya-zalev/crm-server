import { IsIn, IsOptional, IsString } from 'class-validator';
import { roles, type Role, type TeamMemberStatus } from '@app/contracts';

const statuses: TeamMemberStatus[] = ['active', 'invited', 'disabled'];

export class UpdateMemberDto {
  @IsOptional()
  @IsString()
  @IsIn(statuses)
  status?: TeamMemberStatus;

  @IsOptional()
  @IsString()
  @IsIn(roles)
  role?: Role;
}
