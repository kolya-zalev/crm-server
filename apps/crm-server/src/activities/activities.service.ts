import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class ActivitiesService {
  constructor(private readonly prisma: PrismaService) {}

  async findByLead(leadId: string) {
    return this.prisma.activity.findMany({
      where: { leadId },
      orderBy: { createdAt: "desc" },
    });
  }
}
