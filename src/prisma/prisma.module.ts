import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

// prisma.module.ts
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}