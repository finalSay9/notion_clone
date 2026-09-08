import { Controller,Body, Post, UseGuards, Req } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { LocalAuthGuard } from './guards/local.guard';


@Controller('auth')
export class AuthController {

    constructor(private authService: AuthService){}

  @Post('register')
    async createUser(@Body() createUserDto: CreateUserDto) {
    return await this.authService.createUser(createUserDto);
   }

  @UseGuards(LocalAuthGuard)
  @Post('login')
    login(@Body() loginDto: LoginDto) {
      return this.authService.login(loginDto);
    }
}
