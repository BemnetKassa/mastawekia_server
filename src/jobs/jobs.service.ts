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
      company: data.company,
      userId: userId,
    },
  });
}
}
