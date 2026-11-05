import type { IncomingHttpHeaders } from "node:http";
import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { fromNodeHeaders } from "better-auth/node";
import { getPermissionsForRole, type Actor } from "@app/contracts";
import { AUTH, type Auth } from "./better-auth";
import { isPublicKey } from "./public.decorator";

@Injectable()
export class SessionAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @Inject(AUTH) private readonly auth: Auth,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(isPublicKey, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context
      .switchToHttp()
      .getRequest<{ headers: IncomingHttpHeaders; user?: Actor }>();

    const session = await this.auth.api.getSession({
      headers: fromNodeHeaders(request.headers),
    });
    if (!session) {
      throw new UnauthorizedException();
    }

    const { user } = session;
    request.user = {
      id: user.id,
      name: user.name,
      role: user.role,
      permissions: getPermissionsForRole(user.role),
    };
    return true;
  }
}
