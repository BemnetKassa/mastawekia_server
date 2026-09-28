import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ApplicationStatus, Prisma } from '@prisma/client';
import { CreateApplicationDto } from './dto/create-application.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ApplicationsService {
  constructor(private prisma: PrismaService) {}

  async createApplication(userId: string, dto: CreateApplicationDto) {
    const { jobId, coverLetter, resumeUrl, portfolioUrl } = dto;

    if (!jobId || !coverLetter || !resumeUrl) {
      throw new BadRequestException(
        'jobId, coverLetter, and resumeUrl are required.',
      );
    }

    const [user, job] = await Promise.all([
      this.prisma.user.findUnique({ where: { id: userId } }),
      this.prisma.jobPost.findUnique({
        where: { id: jobId },
        include: { company: true },
      }),
    ]);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    if (!job.isOpen) {
      throw new BadRequestException('This job is no longer open.');
    }

    const existingApplication = await this.prisma.application.findUnique({
      where: {
        userId_jobId: {
          userId,
          jobId,
        },
      },
    });

    if (existingApplication) {
      throw new ConflictException('You have already applied to this job.');
    }

    const application = await this.prisma.application.create({
      data: {
        userId,
        jobId,
        coverLetter,
        resumeUrl,
        portfolioUrl,
        status: ApplicationStatus.PENDING,
      },
      include: {
        job: {
          include: {
            company: true,
          },
        },
      },
    });

    return {
      id: application.id,
      status: application.status,
      createdAt: application.createdAt,
      job: {
        id: application.job.id,
        title: application.job.title,
        company: application.job.company.name,
      },
      coverLetter: application.coverLetter,
      resumeUrl: application.resumeUrl,
      portfolioUrl: application.portfolioUrl,
    };
  }

  async getApplicationsForClient(userId: string) {
    const applications = await this.prisma.application.findMany({
      where: {
        job: {
          OR: [{ userId }, { company: { ownerId: userId } }],
        },
      },
      include: {
        user: { include: { profile: true } },
        job: { include: { company: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return applications.map((application) => ({
      id: application.id,
      status: application.status,
      createdAt: application.createdAt,
      coverLetter: application.coverLetter,
      resumeUrl: application.resumeUrl,
      portfolioUrl: application.portfolioUrl,
      applicant: {
        id: application.user.id,
        email: application.user.email,
        profile: application.user.profile,
      },
      job: {
        id: application.job.id,
        title: application.job.title,
        company: application.job.company.name,
      },
    }));
  }

  async getApplicationsForUser(userId: string) {
    const applications = await this.prisma.application.findMany({
      where: { userId },
      include: {
        job: {
          include: {
            company: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return applications.map((application) => ({
      id: application.id,
      status: application.status,
      createdAt: application.createdAt,
      coverLetter: application.coverLetter,
      resumeUrl: application.resumeUrl,
      portfolioUrl: application.portfolioUrl,
      job: {
        id: application.job.id,
        title: application.job.title,
        company: application.job.company.name,
      },
    }));
  }

  async getApplicationById(applicationId: string, userId: string, role: string) {
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        user: true,
        job: {
          include: {
            company: true,
          },
        },
      },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    if (role === 'USER' && application.userId !== userId) {
      throw new ForbiddenException('You can only view your own applications.');
    }

    if (role === 'CLIENT') {
      const isOwner =
        application.job.userId === userId ||
        application.job.company.ownerId === userId;

      if (!isOwner) {
        throw new ForbiddenException(
          'You do not have access to this application.',
        );
      }
    }

    return {
      id: application.id,
      status: application.status,
      createdAt: application.createdAt,
      coverLetter: application.coverLetter,
      resumeUrl: application.resumeUrl,
      portfolioUrl: application.portfolioUrl,
      job: {
        id: application.job.id,
        title: application.job.title,
        company: application.job.company.name,
      },
    };
  }

  async getApplicationsForJob(jobId: string, clientUserId: string) {
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
        user: {
          include: {
            profile: true,
          },
        },
        job: {
          include: {
            company: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateStatus(
    applicationId: string,
    clientUserId: string,
    status: ApplicationStatus,
  ) {
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        job: {
          include: {
            company: true,
          },
        },
      },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    const isAuthorized =
      application.job.userId === clientUserId ||
      application.job.company.ownerId === clientUserId;

    if (!isAuthorized) {
      throw new ForbiddenException(
        'Only the job owner or company owner can update this application status.',
      );
    }

    if (
      application.userId === clientUserId &&
      (status === ApplicationStatus.ACCEPTED ||
        status === ApplicationStatus.REJECTED)
    ) {
      throw new ForbiddenException(
        'Users cannot set their own application to ACCEPTED or REJECTED.',
      );
    }

    const updatedApplication = await this.prisma.application.update({
      where: { id: applicationId },
      data: { status },
      include: {
        job: {
          include: {
            company: true,
          },
        },
      },
    });

    return {
      id: updatedApplication.id,
      status: updatedApplication.status,
      createdAt: updatedApplication.createdAt,
      coverLetter: updatedApplication.coverLetter,
      resumeUrl: updatedApplication.resumeUrl,
      portfolioUrl: updatedApplication.portfolioUrl,
      job: {
        id: updatedApplication.job.id,
        title: updatedApplication.job.title,
        company: updatedApplication.job.company.name,
      },
    };
  }

  async withdrawApplication(applicationId: string, userId: string) {
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    if (application.userId !== userId) {
      throw new ForbiddenException('Only the applicant can withdraw this application.');
    }

    if (
      ![
        ApplicationStatus.PENDING,
        ApplicationStatus.REVIEWING,
        ApplicationStatus.SHORTLISTED,
      ].includes(application.status)
    ) {
      throw new BadRequestException(
        'Only applications in PENDING, REVIEWING, or SHORTLISTED can be withdrawn.',
      );
    }

    return this.prisma.application.update({
      where: { id: applicationId },
      data: { status: ApplicationStatus.WITHDRAWN },
      include: {
        job: {
          include: {
            company: true,
          },
        },
      },
    });
  }
}
