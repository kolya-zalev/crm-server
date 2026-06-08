import {
  IsArray, IsEmail, IsEnum, IsOptional, IsString, MaxLength, MinLength,
} from 'class-validator';
import { PartialType } from '@nestjs/swagger';

const LEAD_STATUSES = ['new', 'contacted', 'qualified', 'won', 'lost'] as const;

// POST /api/leads — что приходит при создании
export class CreateLeadDto {
  @IsString()
  @MinLength(1, { message: 'Name is required' })
  name: string;

  @IsEmail({}, { message: 'Invalid email' })
  email: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsString()
  @MinLength(1, { message: 'Company is required' })
  company: string;

  @IsEnum(LEAD_STATUSES, { message: 'Invalid status' })
  status: (typeof LEAD_STATUSES)[number];

  @IsArray()
  @IsString({ each: true })
  tags: string[];

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  source?: string;
}

// PUT /api/leads/:id — все поля опциональные
export class UpdateLeadDto extends PartialType(CreateLeadDto) {}
