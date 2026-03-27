// src/auth/dto/register.dto.ts
import { Role } from '@prisma/client';
import { IsEmail, IsEnum } from 'class-validator';

export class RegisterDto {
  constructor(email: string, password: string, role: Role) {
    this.email = email;
    this.password = password;
    this.role = role;
  }

  @IsEmail()
  email: string;

  password: string;

  @IsEnum(Role)
  role: Role;
}