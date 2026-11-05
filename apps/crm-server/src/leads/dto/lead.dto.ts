import {
  IsArray,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from "class-validator";
import { PartialType } from "@nestjs/swagger";
import { IsUUID, ValidateIf } from "class-validator";

const LeadStatuses = ["new", "contacted", "qualified", "won", "lost"] as const;

export class CreateLeadDto {
  @IsString()
  @MinLength(1, { message: "Name is required" })
  name: string;

  @IsEmail({}, { message: "Invalid email" })
  email: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsString()
  @MinLength(1, { message: "Company is required" })
  company: string;

  @IsEnum(LeadStatuses, { message: "Invalid status" })
  status: (typeof LeadStatuses)[number];

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

export class UpdateLeadDto extends PartialType(CreateLeadDto) {
  @IsOptional()
  @ValidateIf((_, v) => v !== null)
  @IsUUID()
  assignedToId?: string | null;
}
