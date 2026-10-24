import { Injectable } from "@nestjs/common";
import type { ActivityDto, LeadIdPayload } from "@app/contracts";
import { PrismaService } from "../prisma/prisma.service";
import { toActivityDto } from "../leads/leads.mapper";

@Injectable()
export class ActivitiesService {
  constructor(private readonly prisma: PrismaService) {}

  async findByLead({ leadId }: LeadIdPayload): Promise<ActivityDto[]> {
    const activities = await this.prisma.activity.findMany({
      where: { leadId },
      orderBy: { createdAt: "desc" },
    });
    return activities.map(toActivityDto);
  }
}
