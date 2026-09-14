import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { WebSocketServer } from 'ws';
import { Server as HocuspocusServer } from '@hocuspocus/server';
import { AppModule } from './app.module';
import { PrismaService } from './prisma/prisma.service';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors();

  // ---- Your existing TCP microservice listener (unchanged) ----
  // This is what your @MessagePattern handlers (create_document,
  // get_documents, update_document, delete_document, etc.) run on.
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      host: '0.0.0.0',
      port: 3012, // <-- use whatever TCP port you actually set up before
    },
  });

  const prisma = app.get(PrismaService);

  // ---- Hocuspocus, configured but not listening on its own port ----
  const hocuspocus = HocuspocusServer.configure({
    async onLoadDocument({ documentName, document }) {
      const record = await prisma.document.findUnique({
        where: { id: documentName },
      });
      if (record?.contentBinary) {
        const { applyUpdate } = await import('yjs');
        applyUpdate(document, record.contentBinary);
      }
      return document;
    },

    async onStoreDocument({ documentName, document }) {
      const { encodeStateAsUpdate } = await import('yjs');
      const update = encodeStateAsUpdate(document);
      await prisma.document.update({
        where: { id: documentName },
        data: { contentBinary: Buffer.from(update) },
      });
    },

    async onAuthenticate() {
      return {}; // TEMPORARY — no real auth check yet
    },
  });

  const wss = new WebSocketServer({ noServer: true });
  const httpServer = app.getHttpServer();

  httpServer.on('upgrade', (request: any, socket: any, head: any) => {
    const url = new URL(request.url, `http://${request.headers.host}`);
    if (url.pathname === '/collaboration') {
      wss.handleUpgrade(request, socket, head, (ws) => {
        hocuspocus.handleConnection(ws, request);
      });
    }
  });

  await app.startAllMicroservices();
  await app.listen(process.env.PORT ?? 3002);
}
bootstrap();