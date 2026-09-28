import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProfileDto } from './dto/create-profile.dto';

@Injectable()
export class ProfileService {
  constructor(private prisma: PrismaService) {}

  async createProfile(data: CreateProfileDto, userId: string) {
    return this.prisma.profile.upsert({
      where: { userId },
      update: {
        headline: data.headline,
        bio: data.bio,
        skills: data.skills,
        location: data.location,
        phone: data.phone,
        experienceYears: data.experienceYears,
        availability: data.availability,
        portfolioUrl: data.portfolioUrl,
        linkedinUrl: data.linkedinUrl,
        githubUrl: data.githubUrl,
      },
      create: {
        headline: data.headline,
        bio: data.bio,
        skills: data.skills,
        location: data.location,
        phone: data.phone,
        experienceYears: data.experienceYears,
        availability: data.availability,
        portfolioUrl: data.portfolioUrl,
        linkedinUrl: data.linkedinUrl,
        githubUrl: data.githubUrl,
        userId,
      },
    });
  }

  async getProfileByUserId(userId: string) {
    return this.prisma.profile.findUnique({ where: { userId } });
  }

  async getProfile(id: string) {
    return this.prisma.profile.findUnique({
      where: { id },
    });
  }
}
