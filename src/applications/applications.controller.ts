import { Controller } from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/common/decorators/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Post, Get, Param, Request, Patch, Body } from '@nestjs/common';

@Controller('applications')
export class ApplicationsController {
  constructor(private applicationsService: ApplicationsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('USER')
  @Post(':jobId')
  apply(@Param('jobId') jobId: string, @Request() req) {
    return this.applicationsService.apply(req.user.userId, jobId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CLIENT')
  @Get()
  getApplications(@Request() req) {
    return this.applicationsService.getApplicationsForClient(req.user.userId);
  }

  // GET /applications/me
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('USER')
  @Get('me')
  getMyApplications(@Request() req) {
    return this.applicationsService.getApplicationsForUser(req.user.userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CLIENT')
  @Patch(':id')
  updateStatus(@Param('id') id: string, @Body() body) {
    return this.applicationsService.updateStatus(id, body.status);
  }
}
