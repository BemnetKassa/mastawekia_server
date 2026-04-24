import { Controller } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { RolesGuard } from 'src/common/decorators/roles.guard';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Roles } from 'src/common/decorators/roles.decorator';

@Controller('profile')
export class ProfileController {
  constructor(
    private readonly profileService: ProfileService,
    private prisma: PrismaService,
  ) {}
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('USER')
  @Post()
  async createProfile(@Body() data, @Request() req) {
    return this.profileService.createProfile(data, req.user.userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('USER')
  @Get(':id')
  async getProfile(@Param('id') id: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { id },
    });
    return profile;
  }
}
