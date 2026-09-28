import { Controller } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { RolesGuard } from 'src/common/decorators/roles.guard';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { CreateProfileDto } from './dto/create-profile.dto';

@Controller('profile')
export class ProfileController {
  constructor(
    private readonly profileService: ProfileService,
  ) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('USER')
  @Post()
  async createProfile(@Body() data: CreateProfileDto, @Request() req) {
    const userId = req.user.userId;
    return this.profileService.createProfile(data, userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('USER')
  @Get()
  async getMyProfile(@Request() req) {
    const userId = req.user.userId;
    return this.profileService.getProfileByUserId(userId);
  }
}
