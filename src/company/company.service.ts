import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateCompanyDto } from './dto/update-company.dto';

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

  async updateCompany(
    companyId: string,
    data: UpdateCompanyDto,
    userId: string,
  ) {
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    if (company.ownerId !== userId) {
      throw new ForbiddenException(
        'Only the company owner can update this company.',
      );
    }

    return this.prisma.company.update({
      where: { id: companyId },
      data: {
        name: data.name,
        description: data.description,
      },
    });
  }
}
