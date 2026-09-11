import { Controller,Body, Post, UseGuards, Req, Get } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local.guard';
import { JwtAuthGuard } from './guards/jwt.guard';
import { MessagePattern, Payload } from '@nestjs/microservices';


@Controller('auth')
export class AuthController {

    constructor(private authService: AuthService){}


    @MessagePattern({cmd: 'register'})
    async createUser(@Payload() createUserDto: CreateUserDto) {
    return await this.authService.createUser(createUserDto);
   }

  /**
   * here the useguards
   * block the direct
   * access to the endpoint
   */ 
    @MessagePattern({cmd: 'auth.login'})
    login(@Payload() loginDto: any) {
      return this.authService.login(loginDto);
    }

  
  @MessagePattern({cmd: 'auth.get-current-user'})
  async getCurrentUser(@Payload() payload: {userId: string} ) {
  
    return this.authService.getCurrentUser(payload.userId);
  }
}
