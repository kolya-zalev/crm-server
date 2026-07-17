import { IsEmail, IsIn, IsNotEmpty, IsString } from 'class-validator';

export class InviteMemberDto {
  @IsEmail()
  @IsNotEmpty()
  @IsString()
  email!: string;

  @IsIn(['admin', 'manager', 'member'])
  @IsNotEmpty()
  @IsString()
  role!: string;
}
