import { Injectable, ExecutionContext, CanActivate } from "@nestjs/common";


@Injectable()
export class AuthGuard implements CanActivate {
    /**
     * implenting canactivate
     * function
     */
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        return await this.validateRequest(request);
    }

    private async validateRequest(request: any): Promise<boolean> {
        return true;
    }
}