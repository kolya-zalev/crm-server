import { IsEmail, IsIn, IsNotEmpty, IsString } from 'class-validator';
import { roles, type Role } from '@app/contracts';

export class InviteMemberDto {
  @IsEmail()
  @IsNotEmpty()
  @IsString()
  email!: string;

  @IsIn(roles)
  @IsNotEmpty()
  @IsString()
  role!: Role;
}
