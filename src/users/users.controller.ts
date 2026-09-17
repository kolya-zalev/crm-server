import { Controller, Get } from "@nestjs/common";
import { Roles } from "src/auth/roles.decorator";
import { userService } from "./users.service";

@Controller("/api/users")
@Roles("admin", "member")
export class userController {
  constructor(private readonly userService: userService) {}

  @Get("assignable")
  listAssignable() {
    return this.userService.listAssignable();
  }
}
