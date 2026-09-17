import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export type Actor = { id: string; name: string; role: string };

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): Actor => {
    const request = context.switchToHttp().getRequest<{ user: Actor }>();
    return request.user;
  },
);
