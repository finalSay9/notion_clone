import { IsEmail, IsNotEmpty, IsString, Matches, MinLength } from "class-validator";


export class CreateUserDto {

    @IsEmail()
    @IsNotEmpty()
    email!: string

    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/, {
    message:
      'Password must contain uppercase, lowercase, number and special character',
    })
    password!: string
    
}