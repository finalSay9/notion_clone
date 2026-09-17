import 'dotenv/config';

import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { Hocuspocus, type WebSocketLike } from '@hocuspocus/server';
import crossws from 'crossws/adapters/node';
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
      port: 3007, // <-- your actual TCP port, confirm this matches what you already have
    },
  });

  const prisma = app.get(PrismaService);

  // ---- Hocuspocus v4: instantiate directly, do NOT call .listen() ----
  // (v4 no longer has Server.configure() — Hocuspocus is now a plain
  // class you construct, and you hand it connections yourself.)
  const hocuspocus = new Hocuspocus({
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

  // ---- crossws: the official v4 way to bridge Node's raw 'upgrade'
  // event to Hocuspocus. crossws normalizes the request/socket across
  // runtimes (Node, Bun, Deno, Workers) — this is the officially
  // documented pattern for Express/Nest as of Hocuspocus v4.
  const ws = crossws({
    hooks: {
      open(peer) {
        const clientConnection = hocuspocus.handleConnection(
          peer.websocket as unknown as WebSocketLike,
          peer.request as Request,
        );
        // Stash the connection on the peer so the other hooks below
        // can find it again for this same socket.
        (peer as any)._hocuspocus = clientConnection;
      },
      message(peer, message) {
        (peer as any)._hocuspocus?.handleMessage(message.uint8Array());
      },
      close(peer, event) {
        (peer as any)._hocuspocus?.handleClose({
          code: event.code,
          reason: event.reason,
        });
      },
      error(peer, error) {
        console.error('Collaboration WebSocket error:', error);
      },
    },
  });

  // Get Nest's actual underlying Node http.Server and hand raw
  // 'upgrade' events to crossws. Nest's own HTTP routing is
  // completely unaffected — this only fires for WebSocket upgrade
  // requests, which normal HTTP requests never trigger.
  const httpServer = app.getHttpServer();
  httpServer.on('upgrade', (request: any, socket: any, head: any) => {
    ws.handleUpgrade(request, socket, head);
  });

  await app.startAllMicroservices();
  await app.listen(process.env.PORT ?? 3002);
}
bootstrap();