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
    const job = await this.prisma.jobPost.create({
      data: {
        title: data.title,
        description: data.description,
        userId: userId,
        companyId: data.companyId,
      },
      include: {
        company: true,
        applications: true,
      },
    });

    return {
      ...job,
      status: job.isPublished ? 'ACTIVE' : 'INACTIVE',
    };
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
        isPublished:
          role === Role.CLIENT || role === Role.ADMIN ? undefined : true,
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
      status: job.isPublished ? 'ACTIVE' : 'INACTIVE',
      company: companyDetails.name,
      companyDetails,
    }));
  }

  async getJob(id: string, userId: string, role: Role) {
    const job = await this.prisma.jobPost.findUnique({
      where: { id },
      include: { company: true, applications: true },
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    if (role === Role.CLIENT && job.userId !== userId) {
      throw new ForbiddenException(
        'You can only view your own job details.',
      );
    }

    if (role !== Role.CLIENT && role !== Role.ADMIN && !job.isPublished) {
      throw new NotFoundException('Job not found');
    }

    return {
      ...job,
      status: job.isPublished ? 'ACTIVE' : 'INACTIVE',
    };
  }

  async updatePublication(
    jobId: string,
    isPublished: boolean,
    clientUserId: string,
  ) {
    const job = await this.prisma.jobPost.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    if (job.userId !== clientUserId) {
      throw new ForbiddenException(
        'Only the job owner can change its publication status.',
      );
    }

    const updatedJob = await this.prisma.jobPost.update({
      where: { id: jobId },
      data: { isPublished },
      include: {
        company: true,
        applications: true,
      },
    });

    return {
      ...updatedJob,
      status: updatedJob.isPublished ? 'ACTIVE' : 'INACTIVE',
    };
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
