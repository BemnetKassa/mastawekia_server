import { Controller } from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/decorators/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Post, Param, Request } from '@nestjs/common';

@Controller('applications')
export class ApplicationsController {
  constructor(private applicationsService: ApplicationsService) {}
  

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('USER')
@Post(':jobId')
apply(@Param('jobId') jobId: string, @Request() req) {
  return this.applicationsService.apply(req.user.userId, jobId);
}
}