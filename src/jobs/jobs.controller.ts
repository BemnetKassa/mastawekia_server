import {
  Body,
  Controller,
  Get,
  Post,
  Patch,
  UseGuards,
  Request,
  Param,
  Query,
} from '@nestjs/common';
import { JobsService } from './jobs.service';
import { RolesGuard } from 'src/common/decorators/roles.guard';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UpdatePublicationDto } from './dto/update-publication.dto';

@Controller('jobs')
export class JobsController {
  constructor(private jobsService: JobsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CLIENT')
  @Post()
  createJob(@Body() body, @Request() req) {
    console.log(req.user);
    return this.jobsService.createJob(body, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  getJobs(
    @Request() req,
    @Query('search') search?: string,
    @Query('company') company?: string,
  ) {
    return this.jobsService.getJobs(
      req.user.userId,
      req.user.role,
      search,
      company,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CLIENT')
  @Get(':jobId/applications')
  getJobApplications(@Param('jobId') jobId: string, @Request() req) {
    return this.jobsService.getJobApplications(jobId, req.user.userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CLIENT')
  @Patch(':jobId/publish')
  updatePublication(
    @Param('jobId') jobId: string,
    @Body() body: UpdatePublicationDto,
    @Request() req,
  ) {
    return this.jobsService.updatePublication(
      jobId,
      body.isPublished,
      req.user.userId,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  getJob(@Param('id') id: string, @Request() req) {
    return this.jobsService.getJob(id, req.user.userId, req.user.role);
  }
}
