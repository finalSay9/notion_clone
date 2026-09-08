import { Controller,Body, Post, UseGuards, Req, Get } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { LocalAuthGuard } from './guards/local.guard';
import { JwtAuthGuard } from './guards/jwt.guard';


@Controller('auth')
export class AuthController {

    constructor(private authService: AuthService){}

  @Post('register')
    async createUser(@Body() createUserDto: CreateUserDto) {
    return await this.authService.createUser(createUserDto);
   }

  @UseGuards(LocalAuthGuard)
  @Post('login')
    login(@Req() req) {
      return this.authService.login(req.user);
    }

  @UseGuards(JwtAuthGuard)
  @Get('me') // Endpoint: GET /auth/me
  async getCurrentUser(@Req() req) {
    // req.user contains { userId: '...', email: '...' } from JwtStrategy
    return this.authService.getCurrentUser(req.user.userId);
  }
}
