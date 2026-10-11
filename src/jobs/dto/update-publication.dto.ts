import { IsBoolean } from 'class-validator';

export class UpdatePublicationDto {
  @IsBoolean()
  isPublished: boolean;
}
