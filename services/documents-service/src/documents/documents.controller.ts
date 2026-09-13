import { Controller } from '@nestjs/common';
import { CreateDocumentDto } from './dto/create-document.dto';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { DocumentsService } from './documents.service';

@Controller('documents')
export class DocumentsController {

    constructor(private documentService: DocumentsService){}

    @MessagePattern({cmd: 'createDocument'})
    async createDocument(@Payload() dto: CreateDocumentDto, userId: string) {
        return this.documentService.createDocument(dto, userId)

    }


}
