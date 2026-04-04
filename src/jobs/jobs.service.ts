import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class JobsService {
  constructor(private prisma: PrismaService) {}

  async createJob(data: any, userId: string) {
    return this.prisma.jobPost.create({
      data: {
        title: data.title,
        description: data.description,
        userId: userId,
        companyId: data.companyId,
      },
    });
  }

  async getJobs(userId?: string, search?: string, company?: string) {
    return this.prisma.jobPost.findMany({
      where: {
        title: search
          ? {
              contains: search,
              mode: 'insensitive',
            }
          : undefined,
        company: company
          ? {
              name: {
                contains: company,
                mode: 'insensitive',
              },
            }
          : undefined,
      },
      include: userId
        ? {
            applications: {
              where: { userId },
            },
          }
        : {},
    });
  }

  async getJob(id: string) {
    return this.prisma.jobPost.findUnique({
      where: { id },
    });
  }
}
