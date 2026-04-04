import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CompanyService {
  constructor(private prisma: PrismaService) {}

  async create(data: any, userId: string) {
    return this.prisma.company.create({
      data: {
        name: data.name,
        description: data.description,
        ownerId: userId,
      },
    });
  }

  async getCompany(id: string) {
    return this.prisma.company.findUnique({
      where: { id },
      include: {
        jobs: true,
      },
    });
  }

  async getMyCompanies(userId: string) {
    return this.prisma.company.findMany({
      where: { ownerId: userId },
      include: {
        jobs: true,
      },
    });
  }
}
