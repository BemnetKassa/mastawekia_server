import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ProfileService {
  constructor(private prisma: PrismaService) {}

  async createProfile(data: any, userId: string) {
    return this.prisma.profile.upsert({
      where: { userId },
      update: {
        bio: data.bio,
        skills: data.skills,
      },
      create: {
        bio: data.bio,
        skills: data.skills,
        userId,
      },
    });
  }

  async getProfile(id: string) {
    return this.prisma.profile.findUnique({
      where: { id },
    });
  }
}
