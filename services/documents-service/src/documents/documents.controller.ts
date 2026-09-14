import { Controller } from '@nestjs/common';
import { CreateDocumentDto } from './dto/create-document.dto';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { DocumentsService } from './documents.service';
import { QueryDocumentDto } from './dto/queryDoc.dto';
import { UpdateDocumentDto } from './dto/updateDoc.dto';

@Controller('documents')
export class DocumentsController {

    constructor(private documentsService: DocumentsService){}

  @MessagePattern({ cmd: 'create_document' })
  async createDocument(@Payload() data: { dto: CreateDocumentDto; userId: string }) {
  return this.documentsService.createDocument(data.dto, data.userId);
  }


  @MessagePattern({cmd: 'get_documents'})
  async getDocuments(@Payload() data: {dto: QueryDocumentDto; userId: string}) {
    return this.documentsService.getDocuments(data.userId, data.dto)
  }

  @MessagePattern({cmd: 'get_documentById'})
  async getDocumentById(@Payload() data: {userId: string; documentId: string}) {
    return this.documentsService.getDocumentById(data.userId, data.documentId)
  }

  @MessagePattern({cmd: 'update_document'})
  async updateDocument(
    @Payload() data: {dto: UpdateDocumentDto; documentId: string; userId: string}) {
      return this.documentsService.updateDocument(data.dto, data.documentId, data.userId)
    }

}
