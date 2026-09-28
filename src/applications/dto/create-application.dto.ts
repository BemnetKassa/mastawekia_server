import { IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';

export class CreateApplicationDto {
  @IsString()
  @IsNotEmpty()
  jobId: string;

  @IsString()
  @IsNotEmpty()
  coverLetter: string;

  @IsOptional()
  @IsUrl()
  portfolioUrl?: string;
}