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

@Controller('gateway')
export class GatewayController {

  constructor(
     @Inject('USERS_SERVICE') private readonly usersService: ClientProxy,
     private readonly gatewaySerive: GatewayService
  ){}

  /**
   * Registering a 
   * user
   */
  @Post('register')
  async createUser() {
    
  }
}
