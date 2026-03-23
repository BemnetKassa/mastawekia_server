import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt'
@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService
  
  ) {}

  async register(email: string, password: string) {
  const hashedPassword = await bcrypt.hash(password, 10);

  return this.prisma.user.create({
    data: {
      email,
      password: hashedPassword,
    },
  });
}

async login(email: string, password: string) {
  const user = await this.prisma.user.findUnique({
    where: { email },
  });

  if (!user) throw new Error("User not found");

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) throw new Error("Invalid credentials");

  const token = this.jwtService.sign({ 
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  return {
    access_token: token,
  }; 
}
}
