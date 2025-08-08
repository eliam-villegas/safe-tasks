import {Injectable, CanActivate, ExecutionContext, UnauthorizedException} from "@nestjs/common";

@Injectable()
export class AdminGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        if (user?.role !== "admin") {
            throw new UnauthorizedException("Solo los administradores pueden acceder a esta recurso");
        }
        return true
    }
}