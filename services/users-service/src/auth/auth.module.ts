
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import type { SignOptions } from 'jsonwebtoken';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
    ConfigModule,
    PassportModule,

    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],

      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),

        signOptions: {
          expiresIn: config.get<string>('JWT_EXPIRES_IN') as SignOptions['expiresIn'] ?? '7d',
        },
      }),
    }),
  ],

  controllers: [AuthController],

  providers: [
    AuthService,
    PrismaService,
  ],

  exports: [
    AuthService,
  ],
})
export class AuthModule {}
