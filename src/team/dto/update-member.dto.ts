import { IsIn, IsOptional, IsString } from 'class-validator';

export class UpdateMemberDto {
  @IsOptional()
  @IsString()
  @IsIn(['active', 'invited', 'disabled'])
  status?: string;

  @IsOptional()
  @IsString()
  @IsIn(['admin', 'manager', 'member'])
  role?: string;
}
