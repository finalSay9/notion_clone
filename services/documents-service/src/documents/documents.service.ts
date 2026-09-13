import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { ClientProxy } from '@nestjs/microservices';
import { QueryDocumentDto } from './dto/queryDoc.dto';





@Injectable()
export class DocumentsService {
    constructor(
        @Inject("USERS_SERVICE") private readonly userClient: ClientProxy,
        private prisma: PrismaService,
        
    ){}


    /**
     * creating a 
     * document
     */
    async createDocument(dto: CreateDocumentDto, userId: string){
        return this.prisma.document.create({
            data: {
                title: dto.title,
                content: dto.content,
                createdById: userId
            }
        })
    }

    /**
     * getting documents
     */
    async getDocuments(userId: string, queryDoc: QueryDocumentDto) {
        //pagination
        const page = queryDoc.page ?? 1;
        const limit = queryDoc.limit ?? 10;

        //look for the documents of the user
        const userDocuments = await this.prisma.document.findMany({
            where: {
                createdById: userId
            },
            skip: (page - 1) * limit,
            take: limit,
            orderBy: {createdAt: 'desc'}
        });

        return {
            data: userDocuments,
            meta: {page, limit, count: userDocuments.length}
        }
    }
}
