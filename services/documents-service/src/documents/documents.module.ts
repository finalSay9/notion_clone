import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';

import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'USERS_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.USERS_SERVICE_HOST ?? 'localhost',
          port: Number(process.env.USERS_SERVICE_PORT ?? 3002),
        },
      },
    ]),
  ],
  controllers: [DocumentsController],
  providers: [
    DocumentsService,
    PrismaService,
  ],
})
export class DocumentsModule {}