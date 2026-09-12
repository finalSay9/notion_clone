import { Controller } from '@nestjs/common';
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

  
    @MessagePattern({cmd: 'login'})
    login(@Payload() data: {email: string, password: string}) {
      return this.authService.login(data);
    }

  
  @MessagePattern({cmd: 'auth.get-current-user'})
  async getCurrentUser(@Payload() payload: {userId: string} ) {
  
    return this.authService.getCurrentUser(payload.userId);
  }
}
