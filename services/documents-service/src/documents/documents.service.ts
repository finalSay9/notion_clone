import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { DocumentDto } from './dto/create-document.dto';

@Injectable()
export class DocumentsService {
    constructor(private prisma: PrismaService){}


    async createDocument(document: DocumentDto, userId: string){


    }
}
