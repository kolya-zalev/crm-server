import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import type { Actor } from "@app/contracts";

export type { Actor } from "@app/contracts";
export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): Actor => {
    const request = context.switchToHttp().getRequest<{ user: Actor }>();
    return request.user;
  },
);
