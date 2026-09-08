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

  /**
   * validating user
   * method
   */
  async validateUser(loginDto: LoginDto): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: {email: loginDto.email}
    })
    
    if(!user) {
      return null;
    }

    //now checking he passord
    const checkPassword = await argon2.verify(user.password_hash, loginDto.password);
    /**
     * if wrong credentials
     * provided
     */
    if(!checkPassword) {
      return null;
    }
  }




  async login(user: any) {
    
    /**
     * Generate JWT.
     */
    const payload = {email: user.email, sub: user.id};

    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}