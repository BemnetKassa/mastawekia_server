import { IsEnum } from 'class-validator';
import { ModerationStatus } from '@prisma/client';

export class UpdateModerationStatusDto {
  @IsEnum(ModerationStatus)
  status: ModerationStatus;
}
