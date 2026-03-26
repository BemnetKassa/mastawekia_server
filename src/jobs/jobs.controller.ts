import { Body, Controller, Get, Post, UseGuards, Request, Param } from '@nestjs/common';
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
  getJobs() {
    return this.jobsService.getJobs();
  }
  
  @Get(':id')
  getJob(@Param('id') id: string) {
    return this.jobsService.getJob(id);
  }
  
}
