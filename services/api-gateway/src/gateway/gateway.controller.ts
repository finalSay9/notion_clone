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
import { first, firstValueFrom } from "rxjs";
import { CreateUserDto } from "./dto/register.dto";
import { GatewayService } from "./gateway.service";
import { CreateDocumentDto } from "./dto/createDocument.dto";

@Controller('auth')
export class GatewayController {

  constructor(
     @Inject('USERS_SERVICE') private readonly userClient: ClientProxy,
     @Inject('DOCUMENT_SERVICE') private readonly documentClient: ClientProxy,
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


 /**
     * create document
     * here
     */
  @Post('document')
  async createDocument(@Body() CreateDocumentDto, userId: string) {
    return firstValueFrom(
      this.documentClient.send({cmd: 'createDocument'}, this.createDocument, userId)
    )
  }
}
