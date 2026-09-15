import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DocumentsModule } from './documents/documents.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';


@Module({
  imports: [
    ConfigModule.forRoot({
      // Makes ConfigService available everywhere without re-importing
      isGlobal: true,
      envFilePath: '.env',
    }),

    ClientsModule.register([
      {
        name: "USERS_SERVICE",
        transport: Transport.TCP,
        options:{
          host: 'localhost',
          port: 3008
        }
      }
    ]),


    DocumentsModule,
    PrismaModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
