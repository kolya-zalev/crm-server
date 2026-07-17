import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateLeadDto, UpdateLeadDto } from './dto/lead.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class LeadsService {
  constructor(private readonly prisma: PrismaService) {}

  // GET /api/leads
  async findAll() {
    return this.prisma.lead.findMany({
      include: {
        leadNotes: true,
        activities: true,
        tasks: true,
      },
    });
  }

  // GET /api/leads/:id
  async findOne(id: string) {
    const lead = await this.prisma.lead.findUnique({
      where: { id },
      include: {
        leadNotes: true,
        activities: true,
        tasks: true,
      },
    });
    if (!lead) throw new NotFoundException(`Lead ${id} not found`);
    return lead;
  }

  // POST /api/leads
  async create(dto: CreateLeadDto) {
    
    return this.prisma.lead.create({
      data: {
        ...dto,
        activities: {
          create: {
            type: 'lead_created',
            description: 'Lead was created',
          },
        },
      },
      include: {
        activities: true,
      },
    });
  }

  // PUT /api/leads/:id
  async update(id: string, dto: UpdateLeadDto) {
   
    const oldLead = await this.prisma.lead.findUnique({ where: { id } });
    if (!oldLead) throw new NotFoundException(`Lead ${id} not found`);

   
    let activityType = 'lead_updated';
    let activityDesc = 'Lead was updated';

    if (dto.status && dto.status !== oldLead.status) {
      activityType = 'status_changed';
      activityDesc = `${oldLead.status} → ${dto.status}`;
    }

   
    return this.prisma.lead.update({
      where: { id },
      data: {
        ...dto,
        activities: {
          create: {
            type: activityType,
            description: activityDesc,
          },
        },
      },
    });
  }

  // DELETE /api/leads/:id
  async remove(id: string): Promise<void> {
   
    const lead = await this.prisma.lead.findUnique({ where: { id } });
    if (!lead) throw new NotFoundException(`Lead ${id} not found`);

   
    await this.prisma.activity.deleteMany({ where: { leadId: id } });
    await this.prisma.note.deleteMany({ where: { leadId: id } });
    await this.prisma.task.deleteMany({ where: { leadId: id } });

 
    await this.prisma.lead.delete({ where: { id } });
  }

 
  async addActivity(leadId: string, type: string, description: string) {
    return this.prisma.activity.create({
      data: {
        leadId,
        type,
        description,
      },
    });
  }
}