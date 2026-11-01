import { Module } from "@nestjs/common";
import { PrismaModule } from "./prisma/prisma.module";
import { TeamService } from "./team/team.service";
import { UsersController } from "./users/users.controller";
import { TeamController } from "./team/team.controller";
import { UsersService } from "./users/users.service";

@Module({
  imports: [PrismaModule],
  controllers: [UsersController, TeamController],
  providers: [UsersService, TeamService],
})
export class UsersServiceModule {}
