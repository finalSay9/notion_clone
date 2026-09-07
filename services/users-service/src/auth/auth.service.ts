import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';

import * as argon2 from 'argon2';



@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async createUser(dto: CreateUserDto) {
    /**
     * Check whether the email already exists.
     */
    const existingUser = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    if (existingUser) {
      throw new ConflictException('This email already exists');
    }

    /**
     * Hash the plaintext password.
     */
    const passwordHash = await argon2.hash(dto.password);

    /**
     * Remove the plaintext password before
     * sending data to Prisma.
     */
    const { password, ...userFields } = dto;

    const user = await this.prisma.user.create({
      data: {
        ...userFields,
        password_hash: passwordHash,
      },
      select: {
        id: true,
        email: true,
        createdAt: true,
      },
    });
    console.log('User created successfully:', user)

    return {
      message: 'User created successfully',
      data: user,
    };
  }

  async login(loginDto: LoginDto) {
    /**
     * Find the user by email.
     */
    const user = await this.prisma.user.findUnique({
      where: {
        email: loginDto.email,
      },
    });

    /**
     * Don't reveal whether the email exists.
     */
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    /**
     * Compare the plaintext password against
     * the stored Argon2 hash.
     */
    const passwordValid = await argon2.verify(
      user.password_hash,
      loginDto.password,
    );

    if (!passwordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    /**
     * Generate JWT.
     */
    const accessToken = this.jwtService.sign({
      sub: user.id,
      email: user.email,
    });

    return {
      message: 'Login successful',
      accessToken,
    };
  }
}