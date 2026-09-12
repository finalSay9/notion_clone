import {
  Controller,
  Get,
  Body,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  UseGuards,
  Param,
} from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { firstValueFrom } from "rxjs";
import { CreateUserDto } from "./dto/register.dto";
import { GatewayService } from "./gateway.service";

@Controller('auth')
export class GatewayController {

  constructor(
     @Inject('USERS_SERVICE') private readonly userClient: ClientProxy,
     private readonly gatewayService: GatewayService
  ){}

  /**
   * Registering a 
   * user
   */
  @Post('register')
  async createUser(@Body() dto: CreateUserDto) {
    /**
     * now sending a message
     * to users service
     * and wait for response
     */
    return firstValueFrom(
      this.userClient.send({cmd: 'register'}, dto)
    )
  }


  
  /**
   * logging in
   * a user
   */
  @Post('login')
  async login(@Body() login: string) {
    return firstValueFrom(
      this.userClient.send({cmd: 'login'}, login)
    )
  }
}
