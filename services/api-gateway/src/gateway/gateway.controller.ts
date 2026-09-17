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
  Query,
  Patch,
  Delete,
} from "@nestjs/common"; 

import { ClientProxy } from "@nestjs/microservices";
import { first, firstValueFrom } from "rxjs";
import { CreateUserDto } from "./dto/register.dto";
import { GatewayService } from "./gateway.service";
import { CreateDocumentDto } from "./dto/createDocument.dto";
import { QueryDocumentDto } from "./dto/queryDoc.dto";
import { UpdateDocumentDto } from "./dto/updateDoc.dto";
import { InviteUserDto } from "./dto/invite-user.dto";

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
 * here — TEMPORARY: userId comes from the request body directly
 * until JWT verification is wired in. Don't ship this to real
 * users without replacing it with a token-derived userId.
 */
@Post('document')
async createDocument(@Body() body: CreateDocumentDto & { userId: string }) {
  console.log('RAW BODY RECEIVED:', body);   // 👈 temporary debug line
  const { userId, ...dto } = body;

  return firstValueFrom(
    this.documentClient.send({ cmd: 'create_document' }, { dto, userId }),
  );
}

@Get('documents')
async getDocuments(@Query() query: QueryDocumentDto & {userId: string}) {
  const {userId, ...dto} = query
  return firstValueFrom(
    this.documentClient.send({cmd: 'get_documents'}, {dto,userId })
  )
}


@Get('documents/:id')
async getDocumentById(
  @Param('id') documentId: string,
  @Query('userId') userId: string,
) {
  return firstValueFrom(
    this.documentClient.send(
      { cmd: 'get_documentById' },
      { userId, documentId },
    ),
  );
}


@Patch('documents/:id')
async updateDocument(
  @Body() body: UpdateDocumentDto & { userId: string },
  @Param('id') documentId: string,
) {
  const { userId, ...dto } = body;

  return firstValueFrom(
    this.documentClient.send(
      { cmd: 'update_document' },
      { dto, documentId, userId },
    ),
  );
}

@Delete('documents/:id')
async deleteDocument(
  @Param('id') documentId: string,
  @Query('userId') userId: string,
) {
  return firstValueFrom(
    this.documentClient.send(
      { cmd: 'delete_document' },
      { documentId, userId },
    ),
  );
}


@Post('documents/:id/invite')
async inviteUserToDocument(
  @Param('id') documentId: string,
  @Body() body: InviteUserDto & { userId: string },
) {
  const { userId, ...dto } = body;

  return firstValueFrom(
    this.documentClient.send(
      { cmd: 'invite_user_to_document' },
      {
        documentId,
        inviterId: userId,
        email: dto.email,
        role: dto.role ?? 'VIEWER', // default when the client omits it
      },
    ),
  );
}



}


