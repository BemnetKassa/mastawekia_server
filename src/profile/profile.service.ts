import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ProfileService {
  constructor(private prisma: PrismaService) {}

  async createProfile(data: any, userId: string) {
    return this.prisma.profile.create({
      data: {
        bio: data.bio,
        skill: data.skill,
        userId: userId,
      },
    });
  }
  async getProfile(id: string) {
    return this.prisma.profile.findUnique({
      where: { id },
    });
  }
}
