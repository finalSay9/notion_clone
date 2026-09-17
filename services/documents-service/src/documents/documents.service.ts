import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { ClientProxy } from '@nestjs/microservices';
import { QueryDocumentDto } from './dto/queryDoc.dto';
import { firstValueFrom, NotFoundError } from 'rxjs';
import { UpdateDocumentDto } from './dto/updateDoc.dto';
import { DocumentPermissionRole } from 'generated/prisma/enums';





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
    async getDocuments(
  userId: string,
  queryDoc: QueryDocumentDto,
) {
  // Pagination
  const page = queryDoc.page ?? 1;
  const limit = queryDoc.limit ?? 10;

  const userDocuments = await this.prisma.document.findMany({
    where: {
      OR: [
        // User owns the document
        {
          createdById: userId,
        },

        // User has been given permission
        {
          permissions: {
            some: {
              userId: userId,
            },
          },
        },
      ],
    },

    skip: (page - 1) * limit,
    take: limit,

    orderBy: {
      createdAt: 'desc',
    },
  });

  return {
    data: userDocuments,
    meta: {
      page,
      limit,
      count: userDocuments.length,
    },
  };
}

    async getDocumentById(
  userId: string,
  documentId: string,
) {
  const document = await this.prisma.document.findFirst({
    where: {
      id: documentId,

      OR: [
        // Document creator
        {
          createdById: userId,
        },

        // User has permission
        {
          permissions: {
            some: {
              userId: userId,
            },
          },
        },
      ],
    },
  });

  if (!document) {
    throw new NotFoundException(
      'This document is not available',
    );
  }

  return document;
}

    /***
     * update document
     */
    async updateDocument(
  updateDocDto: UpdateDocumentDto,
  documentId: string,
  userId: string,
) {
  // Check whether the user owns the document
  // OR has EDITOR permission.
  const document = await this.prisma.document.findFirst({
    where: {
      id: documentId,

      OR: [
        // Creator
        {
          createdById: userId,
        },

        // Editor
        {
          permissions: {
            some: {
              userId: userId,
              role: DocumentPermissionRole.EDITOR,
            },
          },
        },
      ],
    },
  });

  if (!document) {
    throw new NotFoundException(
      'Document not found or you do not have permission to edit it',
    );
  }

  return this.prisma.document.update({
    where: {
      id: documentId,
    },

    data: {
      title: updateDocDto.title,
      content: updateDocDto.content,
    },
  });
}

    /**
     * deleting a document
     */
    async deleteDocument(
  documentId: string,
  userId: string,
) {
  // Only the creator can delete the document.
  const document = await this.prisma.document.findFirst({
    where: {
      id: documentId,
      createdById: userId,
    },
  });

  if (!document) {
    throw new NotFoundException(
      'Document not found or you do not have permission to delete it',
    );
  }

  return this.prisma.document.delete({
    where: {
      id: documentId,
    },
  });
}

   
   /**
    * inviting a user to
    * collaborate a document
    */
   async inviteUserToDocument(
  documentId: string,
  inviterId: string,
  email: string,
  role: DocumentPermissionRole,
) {
  /**
   * 1. First verify that the requester
   * actually owns the document.
   */
  const document = await this.prisma.document.findFirst({
    where: {
      id: documentId,
      createdById: inviterId,
    },
  });

  if (!document) {
    throw new NotFoundException(
      'Document not found or you do not have permission to invite users',
    );
  }

  /**
   * 2. Now that we know the requester is allowed
   * to invite users, ask the Users Service to
   * find the invitee.
   */
  const user = await firstValueFrom(
    this.userClient.send(
      { cmd: 'get_user_by_email' },
      {
        email: email.trim().toLowerCase(),
      },
    ),
  );

  /**
   * 3. Don't allow the owner to invite themselves.
   */
  if (user.id === inviterId) {
    throw new BadRequestException(
      'You cannot invite yourself to this document',
    );
  }

  /**
   * 4. Check whether this user already has
   * permission for this document.
   */
  const existingPermission =
    await this.prisma.documentPermission.findUnique({
      where: {
        documentId_userId: {
          documentId,
          userId: user.id,
        },
      },
    });

  if (existingPermission) {
    throw new BadRequestException(
      'This user already has access to this document',
    );
  }

  /**
   * 5. Actually create the permission.
   */
  return this.prisma.documentPermission.create({
    data: {
      documentId,
      userId: user.id,
      role,
    },
  });
}


}