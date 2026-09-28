import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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

  async getJobs(userId: string, search?: string, company?: string) {
    return this.prisma.jobPost.findMany({
      where: {
        userId,
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
      include: {
        company: true,
        applications: true,
      },
    });
  }

  async getJob(id: string) {
    return this.prisma.jobPost.findUnique({
      where: { id },
      include: { company: true },
    });
  }

  async getJobApplications(jobId: string, clientUserId: string) {
    const job = await this.prisma.jobPost.findUnique({
      where: { id: jobId },
      include: { company: true },
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    const isAuthorized =
      job.userId === clientUserId || job.company.ownerId === clientUserId;

    if (!isAuthorized) {
      throw new ForbiddenException(
        'Only the job owner or company owner can access this data.',
      );
    }

    return this.prisma.application.findMany({
      where: { jobId },
      include: {
        user: { include: { profile: true } },
        job: { include: { company: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
