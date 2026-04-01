import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'; // Check this path matches your structure, usually ../ or src/prisma


@Injectable()
export class ApplicationsService {
 constructor(private prisma: PrismaService) {}

  async apply(userId: string, jobId: string) {
  const [user, job] = await Promise.all([
    this.prisma.user.findUnique({ where: { id: userId } }),
    this.prisma.jobPost.findUnique({ where: { id: jobId } }),
  ]);

  if (!user) {
    throw new NotFoundException('User not found');
  }

  if (!job) {
    throw new NotFoundException('Job not found');
  }

  return this.prisma.application.create({
    data: {
      userId,
      jobId,
    },
  });
}

async getApplicationsForClient(userId: string) {
  return this.prisma.application.findMany({
    where: {
      job: {
        userId: userId,
      },
    },
    include: {
      user: true,
      job: true,
    },
  });
}

async updateStatus(applicationId: string, status: "PENDING" | "ACCEPTED" | "REJECTED") {
  return this.prisma.application.update({
    where: { id: applicationId },
    data: { status },
  });
}

}