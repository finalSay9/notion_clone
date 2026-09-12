import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { DocumentDto } from './dto/create-document.dto';
import { ClientProxy } from '@nestjs/microservices';


@Injectable()
export class DocumentsService {
    constructor(
        @Inject("USERS_SERVICE") private readonly userClient: ClientProxy,
        private prisma: PrismaService,
        
    ){}


    async createDocument(dto: DocumentDto, userId: string){
        return this.prisma.document.create({
            data: {
                title: dto.title,
                content: dto.title,
                createdById: userId
            }
        })
    }
}
