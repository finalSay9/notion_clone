import { Controller, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { AuthService } from './auth.service';
import { MessagePattern, Payload } from '@nestjs/microservices';



@Controller()
export class AuthController {

    constructor(private authService: AuthService){}


    @MessagePattern({cmd: 'register'})
    async createUser(@Payload() createUserDto: CreateUserDto) {
    return await this.authService.createUser(createUserDto);
   }

  // auth.controller.ts
@MessagePattern({cmd: 'login'})
async login(@Payload() data: { email: string; password: string }) {
  const user = await this.authService.validateUser(data.email, data.password);

  if (!user) {
    throw new UnauthorizedException('Invalid email or password');
  }

  return this.authService.login(user);
}

  
  @MessagePattern({cmd: 'auth.get-current-user'})
  async getCurrentUser(@Payload() payload: {userId: string} ) {
  
    return this.authService.getCurrentUser(payload.userId);
  }

  @MessagePattern({cmd: 'get_user_by_email'})
  async getUserByEmail(@Payload() payload: {email: string}) {
    return this.authService.findUserByEmail(payload.email)
  }
}
