import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { mkdirSync } from 'fs';
import { randomUUID } from 'crypto';
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
  @UseInterceptors(
    FileInterceptor('resume', {
      storage: diskStorage({
        destination: (_request, _file, callback) => {
          const uploadDirectory = 'uploads/resumes';
          mkdirSync(uploadDirectory, { recursive: true });
          callback(null, uploadDirectory);
        },
        filename: (_request, file, callback) => {
          callback(null, `${randomUUID()}${extname(file.originalname).toLowerCase()}`);
        },
      }),
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  @Post()
  apply(
    @UploadedFile() resumeFile: Express.Multer.File,
    @Body() dto: CreateApplicationDto,
    @Request() req,
  ) {
    return this.applicationsService.createApplication(req.user.userId, dto, resumeFile);
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
