import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import type { Permission } from "@app/contracts";
import type { Actor } from "./current-user.decorator";

type JwtPayload = {
  sub: string;
  email: string;
  name: string;
  role: string;
  permissions: Permission[];
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        (request: { query?: { access_token?: string | string[] } }) => {
          const token = request?.query?.access_token;
          if (Array.isArray(token)) return token[0] ?? null;
          return token ?? null;
        },
      ]),
      secretOrKey: process.env.JWT_SECRET!,
    });
  }

  validate(payload: JwtPayload): Actor {
    if (!Array.isArray(payload.permissions)) {
      throw new UnauthorizedException();
    }
    return {
      id: payload.sub,
      name: payload.name,
      role: payload.role,
      permissions: payload.permissions,
    };
  }
}
