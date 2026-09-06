import { IsNotEmpty, Matches, IsString, IsEmail, MinLength } from "class-validator";


export class LoginDto {

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