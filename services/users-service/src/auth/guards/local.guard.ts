import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";



@Injectable()
/***
 * everything starts
 * here
 */
export class LocalAuthGuard extends AuthGuard('local'){}