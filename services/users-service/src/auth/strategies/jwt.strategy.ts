import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";


@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super({
            //this is where to find token
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            //now if its expired u need to reject it
            ignoreExpiration: false,
            //finally verify signature using secret
            secretOrKey: process.env.JWT_SECRET || "superSecretKey",
        });
    }

    /**
     * now this will
     * only be executed
     * if signature and expiration all are checked
     */
    async validate(payload: {sub: string; email: string}) {
        //decoded payload becomes req.user
        return {userId: payload.sub, username: payload.email }

    }
}