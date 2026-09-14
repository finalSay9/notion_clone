import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { ClientProxy } from '@nestjs/microservices';
import { QueryDocumentDto } from './dto/queryDoc.dto';
import { NotFoundError } from 'rxjs';
import { UpdateDocumentDto } from './dto/updateDoc.dto';





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

    /**
     * get document
     * by id
     */
    async getDocumentById(userId: string, documentId: string) {
        //first check if the document exist
        const document = await this.prisma.document.findFirst({
            where: {
                id: documentId,
                createdById: userId
            }
        })

        if(!document) {
            throw new NotFoundException('this document is not available')
        }

        return document;

    }

    /***
     * update document
     */
    async updateDocument(updateDocDto: UpdateDocumentDto, documentId: string, userId: string) {
        //check if the document exist
        const document = await this.prisma.document.findFirst({
            where: {
                id: documentId,
                createdById: userId,
            }
        })
         if(!document) {
                throw new NotFoundException("this document doesnt exist")
            }
        
        return this.prisma.document.update({
            where: {
                id: documentId
            },
            data: {
                title: updateDocDto.title,
                content: updateDocDto.content,
                createdById: userId
            }
        })
            
    }

    /**
     * deleting a document
     */
    async deleteDocument(documentId: string, userId: string) {
        //check if the document exist
        

    }
}
