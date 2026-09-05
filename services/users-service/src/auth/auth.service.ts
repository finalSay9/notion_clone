import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class AuthService {
    constructor(private prisma: PrismaService){}

    async createUser(dto: CreateUserDto){
        /**
         * checking if the email
         * already exist in the system
         */
        const existingEmail  = await this.prisma.user.findUnique({
            where:  {email: dto.email}
        })
        //if the email exist
        if(existingEmail){
            throw new ConflictException("this email already exist")
        }
    }
}
