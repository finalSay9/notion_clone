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
    super()
    }

    /**
     * the validate methos to be'
     * executed by the passport
     */

    
}