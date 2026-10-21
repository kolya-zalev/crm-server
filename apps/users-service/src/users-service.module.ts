import { Module } from "@nestjs/common";
import { PrismaModule } from "./prisma/prisma.module";
import { JwtModule } from "@nestjs/jwt";
import { AuthService } from "./auth/auth.service";
import { TeamService } from "./team/team.service";
import { AuthController } from "./auth/auth.controller";
import { UsersController } from "./users/users.controller";
import { TeamController } from "./team/team.controller";
import { UsersService } from "./users/users.service";

@Module({
  imports: [
    PrismaModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: "5h" },
    }),
  ],
  controllers: [AuthController, UsersController, TeamController],
  providers: [UsersService, AuthService, TeamService],
})
export class UsersServiceModule {}
