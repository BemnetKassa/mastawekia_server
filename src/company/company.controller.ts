import { Controller } from '@nestjs/common';
import { Body, Post, Request, UseGuards, Get, Param } from '@nestjs/common';
import { CompanyService } from './company.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/common/decorators/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';

@Controller('company')
export class CompanyController {
  constructor(private companyService: CompanyService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CLIENT')
  @Post()
  createCompany(@Body() body, @Request() req) {
    return this.companyService.create(body, req.user.userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CLIENT')
  @Get('my')
  getMyCompanies(@Request() req) {
    return this.companyService.getMyCompanies(req.user.userId);
  }

  @Get(':id')
  getCompany(@Param('id') id: string) {
    return this.companyService.getCompany(id);
  }
}
