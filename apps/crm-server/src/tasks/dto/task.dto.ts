import { IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { PartialType } from '@nestjs/swagger';

const PRIORITIES = ['low', 'medium', 'high'] as const;
const STATUSES = ['pending', 'completed'] as const;

export class CreateTaskDto {
  @IsString()
  @MinLength(1, { message: 'Title is required' })
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(PRIORITIES, { message: 'Invalid priority' })
  priority: (typeof PRIORITIES)[number];

  @IsString()
  @MinLength(1, { message: 'Due date is required' })
  dueDate: string;
}

export class UpdateTaskDto extends PartialType(CreateTaskDto) {
  @IsOptional()
  @IsEnum(STATUSES)
  status?: (typeof STATUSES)[number];

  @IsOptional()
  @IsString()
  completedAt?: string;
}
