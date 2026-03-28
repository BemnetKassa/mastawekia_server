import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'; // Check this path matches your structure, usually ../ or src/prisma

@Injectable()
export class ApplicationsService {
 constructor(private prisma: PrismaService) {}

  async apply(userId: string, jobId: string) {
  return this.prisma.applications.create({
    data: {
      userId,
      jobId
    }
  });
}

}

