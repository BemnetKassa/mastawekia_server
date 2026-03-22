import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service'; // Adjust the path if needed

@Injectable()
export class AppService {
  constructor(private prisma: PrismaService) {}

  async getUsers() {
    return this.prisma.user.findMany();
  }
}
