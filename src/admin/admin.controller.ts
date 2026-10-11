import {
  Body,
  Controller,
  Get,
  Param,
  ParseEnumPipe,
  ParseIntPipe,
  Patch,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/decorators/roles.guard';
import { AdminService } from './admin.service';
import { UpdateModerationStatusDto } from './dto/update-moderation-status.dto';
import { ModerationStatus } from '@prisma/client';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('overview')
  getOverview(
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('search') search?: string,
    @Query('status', new ParseEnumPipe(ModerationStatus, { optional: true }))
    status?: ModerationStatus,
  ) {
    return this.adminService.getOverview({ page, limit, search, status });
  }

  @Patch('jobs/:id')
  updateJob(
    @Param('id') id: string,
    @Body() dto: UpdateModerationStatusDto,
    @Request() req,
  ) {
    return this.adminService.updateJob(id, dto.status, req.user.userId);
  }

  @Patch('applications/:id')
  updateApplication(
    @Param('id') id: string,
    @Body() dto: UpdateModerationStatusDto,
    @Request() req,
  ) {
    return this.adminService.updateApplication(id, dto.status, req.user.userId);
  }

  @Patch('users/:id')
  updateUser(
    @Param('id') id: string,
    @Body() dto: UpdateModerationStatusDto,
    @Request() req,
  ) {
    return this.adminService.updateUser(id, dto.status, req.user.userId);
  }

  @Patch('companies/:id')
  updateCompany(
    @Param('id') id: string,
    @Body() dto: UpdateModerationStatusDto,
    @Request() req,
  ) {
    return this.adminService.updateCompany(id, dto.status, req.user.userId);
  }
}
