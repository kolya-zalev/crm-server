import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { assignableRoles } from "src/leads/lead-assign.constants";

@Injectable()
export class userService {
  constructor(private readonly prisma: PrismaService) {}

  listAssignable() {
    return this.prisma.user.findMany({
      where: { role: { in: [...assignableRoles] } },
      select: { id: true, name: true, role: true },
      orderBy: { name: "asc" },
    });
  }
}
