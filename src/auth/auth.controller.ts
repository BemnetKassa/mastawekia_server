import { Body, Post, Controller } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')

export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  register(@Body() body: RegisterDto) {
  return this.authService.register(
    body.email,
    body.password,
    body.role
  );
}

  @Post('login')
  Login(@Body() body: { email: string; password: string }) {
    return this.authService.login(body.email, body.password);
  }
}