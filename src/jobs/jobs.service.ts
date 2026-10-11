import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Role } from '@prisma/client';
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

  async getJobs(
    userId: string,
    role: Role,
    search?: string,
    company?: string,
  ) {
    const jobs = await this.prisma.jobPost.findMany({
      where: {
        // Users browse all available jobs; clients only see jobs they created.
        userId: role === Role.CLIENT ? userId : undefined,
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
        ...(role === Role.CLIENT ? { applications: true } : {}),
      },
    });

    // Keep `company` renderable for clients while retaining the full relation.
    return jobs.map(({ company: companyDetails, ...job }) => ({
      ...job,
      company: companyDetails.name,
      companyDetails,
    }));
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
