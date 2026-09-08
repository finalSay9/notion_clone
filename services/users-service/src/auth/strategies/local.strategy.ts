import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-local";
import { AuthService } from "../auth.service";
import { LoginDto } from "../dto/login.dto";


@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
    constructor(private authService: AuthService){
    /**
     * passport looks 
     * for credentials
    */
    super({usernameField: 'email'})
    }

    /**
     * the validate method to be'
     * executed by the passport
     */
    async validate(email: string, pass: string): Promise<any> {
        const user = await this.authService.validateUser(email, pass);
        if(!user) {
            throw new UnauthorizedException("invalid credentials");
        }

        return user;
    }

    
}