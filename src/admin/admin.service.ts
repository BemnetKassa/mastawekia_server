import { Injectable, NotFoundException } from '@nestjs/common';
import { ModerationStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

type OverviewQuery = {
  page?: number;
  limit?: number;
  search?: string;
  status?: ModerationStatus;
};

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getOverview({ page = 1, limit = 10, search, status }: OverviewQuery) {
    const normalizedPage = Math.max(page, 1);
    const normalizedLimit = Math.min(Math.max(limit, 1), 100);
    const skip = (normalizedPage - 1) * normalizedLimit;
    const normalizedSearch = search?.trim();
    const moderationFilter = status ? { moderationStatus: status } : {};

    const [
      totalUsers,
      activeJobs,
      applications,
      companies,
      jobs,
      applicationRecords,
      users,
      companyRecords,
      totalJobs,
      totalApplications,
      totalCompanies,
      totalFilteredUsers,
    ] = await this.prisma.$transaction([
      this.prisma.user.count(),
      this.prisma.jobPost.count({
        where: { moderationStatus: ModerationStatus.ACTIVE },
      }),
      this.prisma.application.count(),
      this.prisma.company.count(),
      this.prisma.jobPost.findMany({
        where: {
          ...moderationFilter,
          ...(normalizedSearch
            ? {
                OR: [
                  { title: { contains: normalizedSearch, mode: 'insensitive' } },
                  {
                    description: {
                      contains: normalizedSearch,
                      mode: 'insensitive',
                    },
                  },
                  {
                    company: {
                      name: {
                        contains: normalizedSearch,
                        mode: 'insensitive',
                      },
                    },
                  },
                ],
              }
            : {}),
        },
        include: { company: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: normalizedLimit,
      }),
      this.prisma.application.findMany({
        where: {
          ...moderationFilter,
          ...(normalizedSearch
            ? {
                OR: [
                  {
                    coverLetter: {
                      contains: normalizedSearch,
                      mode: 'insensitive',
                    },
                  },
                  {
                    user: {
                      email: { contains: normalizedSearch, mode: 'insensitive' },
                    },
                  },
                  {
                    job: {
                      title: { contains: normalizedSearch, mode: 'insensitive' },
                    },
                  },
                ],
              }
            : {}),
        },
        include: {
          user: { select: { id: true, email: true, role: true } },
          job: { select: { id: true, title: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: normalizedLimit,
      }),
      this.prisma.user.findMany({
        where: {
          ...moderationFilter,
          ...(normalizedSearch
            ? {
                email: { contains: normalizedSearch, mode: 'insensitive' },
              }
            : {}),
        },
        select: {
          id: true,
          email: true,
          role: true,
          moderationStatus: true,
          moderatedById: true,
          moderatedAt: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: normalizedLimit,
      }),
      this.prisma.company.findMany({
        where: {
          ...moderationFilter,
          ...(normalizedSearch
            ? { name: { contains: normalizedSearch, mode: 'insensitive' } }
            : {}),
        },
        include: { owner: { select: { id: true, email: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: normalizedLimit,
      }),
      this.prisma.jobPost.count({ where: moderationFilter }),
      this.prisma.application.count({ where: moderationFilter }),
      this.prisma.company.count({ where: moderationFilter }),
      this.prisma.user.count({ where: moderationFilter }),
    ]);

    return {
      metrics: { totalUsers, activeJobs, applications, companies },
      records: {
        jobs: jobs.map((job) => ({
          id: job.id,
          name: job.title,
          detail: job.description,
          status: job.moderationStatus,
          meta: job.company.name,
          createdAt: job.createdAt.toISOString(),
          moderatedById: job.moderatedById,
          moderatedAt: job.moderatedAt?.toISOString() ?? null,
        })),
        applications: applicationRecords.map((application) => ({
          ...application,
          status: application.moderationStatus,
          createdAt: application.createdAt.toISOString(),
          updatedAt: application.updatedAt.toISOString(),
          moderatedAt: application.moderatedAt?.toISOString() ?? null,
        })),
        users: users.map((user) => ({
          ...user,
          status: user.moderationStatus,
          createdAt: user.createdAt.toISOString(),
          moderatedAt: user.moderatedAt?.toISOString() ?? null,
        })),
        companies: companyRecords.map((company) => ({
          ...company,
          status: company.moderationStatus,
          createdAt: company.createdAt.toISOString(),
          moderatedAt: company.moderatedAt?.toISOString() ?? null,
        })),
      },
      pagination: {
        page: normalizedPage,
        limit: normalizedLimit,
        totals: {
          jobs: totalJobs,
          applications: totalApplications,
          users: totalFilteredUsers,
          companies: totalCompanies,
        },
      },
    };
  }

  updateJob(id: string, status: ModerationStatus, adminId: string) {
    return this.updateRecord('jobPost', id, status, adminId);
  }

  updateApplication(id: string, status: ModerationStatus, adminId: string) {
    return this.updateRecord('application', id, status, adminId);
  }

  updateUser(id: string, status: ModerationStatus, adminId: string) {
    return this.updateRecord('user', id, status, adminId);
  }

  updateCompany(id: string, status: ModerationStatus, adminId: string) {
    return this.updateRecord('company', id, status, adminId);
  }

  private async updateRecord(
    model: 'jobPost' | 'application' | 'user' | 'company',
    id: string,
    status: ModerationStatus,
    adminId: string,
  ) {
    const data = {
      moderationStatus: status,
      moderatedById: adminId,
      moderatedAt: new Date(),
    };

    switch (model) {
      case 'jobPost': {
        const record = await this.prisma.jobPost.findUnique({ where: { id } });
        if (!record) throw new NotFoundException('jobPost not found');
        const updated = await this.prisma.jobPost.update({ where: { id }, data });
        return { ...updated, status: updated.moderationStatus };
      }
      case 'application': {
        const record = await this.prisma.application.findUnique({ where: { id } });
        if (!record) throw new NotFoundException('application not found');
        const updated = await this.prisma.application.update({ where: { id }, data });
        return { ...updated, status: updated.moderationStatus };
      }
      case 'user': {
        const record = await this.prisma.user.findUnique({ where: { id } });
        if (!record) throw new NotFoundException('user not found');
        const updated = await this.prisma.user.update({ where: { id }, data });
        const { password: _password, ...safeUser } = updated;
        return { ...safeUser, status: updated.moderationStatus };
      }
      case 'company': {
        const record = await this.prisma.company.findUnique({ where: { id } });
        if (!record) throw new NotFoundException('company not found');
        const updated = await this.prisma.company.update({ where: { id }, data });
        return { ...updated, status: updated.moderationStatus };
      }
    }
  }
}
