import { Module } from '@nestjs/common';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  controllers: [ProfileController],
  providers: [ProfileService],
  imports: [PrismaModule],
})
export class ProfileModule {}
