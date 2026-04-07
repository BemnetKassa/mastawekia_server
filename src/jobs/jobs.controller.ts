import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  Request,
  Param,
  Query,
} from '@nestjs/common';
import { JobsService } from './jobs.service';
import { RolesGuard } from 'src/common/decorators/roles.guard';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Roles } from 'src/common/decorators/roles.decorator';

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

  @Get()
  getJobs(
    @Request() req,
    @Query('search') search?: string,
    @Query('company') company?: string,
  ) {
    const userId = req.user?.userId; // optional
    return this.jobsService.getJobs(userId, search, company);
  }

  @Get(':id')
  getJob(@Param('id') id: string) {
    return this.jobsService.getJob(id);
  }
}
