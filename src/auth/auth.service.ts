import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';

export class AuthService {
  constructor(private prisma: PrismaService) {}

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

    return user; // replace this with JWT next
  }
}