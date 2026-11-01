import { Global, Module } from "@nestjs/common";
import { UsersModule } from "../users/users.module";
import { UsersClient } from "../users/users.client";
import { AuthPrismaService } from "./auth-prisma.service";
import { AUTH, createAuth } from "./better-auth";

// Global: AUTH нужен и guard'у в AppModule, и UsersService (смена пароля).
// Если импортировать AuthModule в UsersModule, получится цикл: AuthModule уже импортирует UsersModule
@Global()
@Module({
  imports: [UsersModule],
  providers: [
    AuthPrismaService,
    {
      provide: AUTH,
      useFactory: createAuth,
      inject: [AuthPrismaService, UsersClient],
    },
  ],
  exports: [AUTH],
})
export class AuthModule {}
