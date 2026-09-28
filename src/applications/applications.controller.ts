import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/decorators/roles.guard';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';

@Controller('applications')
export class ApplicationsController {
  constructor(private applicationsService: ApplicationsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('USER')
  @Post()
  apply(@Body() dto: CreateApplicationDto, @Request() req) {
    return this.applicationsService.createApplication(req.user.userId, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('USER')
  @Get('me')
  getMyApplications(@Request() req) {
    return this.applicationsService.getApplicationsForUser(req.user.userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('USER', 'CLIENT')
  @Get(':id')
  getOneApplication(@Param('id') id: string, @Request() req) {
    return this.applicationsService.getApplicationById(id, req.user.userId, req.user.role);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CLIENT')
  @Get('job/:jobId')
  getApplicationsForJob(@Param('jobId') jobId: string, @Request() req) {
    return this.applicationsService.getApplicationsForJob(jobId, req.user.userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CLIENT')
  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateApplicationStatusDto,
    @Request() req,
  ) {
    return this.applicationsService.updateStatus(id, req.user.userId, dto.status);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('USER')
  @Patch(':id/withdraw')
  withdrawApplication(@Param('id') id: string, @Request() req) {
    return this.applicationsService.withdrawApplication(id, req.user.userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CLIENT')
  @Get()
  getAllClientApplications(@Request() req) {
    return this.applicationsService.getApplicationsForClient(req.user.userId);
  }
}
