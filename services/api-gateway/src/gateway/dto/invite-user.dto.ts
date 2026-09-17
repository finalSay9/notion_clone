import { IsEmail, IsIn, IsNotEmpty, IsOptional } from 'class-validator';

export class InviteUserDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsOptional()
  @IsIn(['VIEWER', 'EDITOR'])
  role?: 'VIEWER' | 'EDITOR';
}