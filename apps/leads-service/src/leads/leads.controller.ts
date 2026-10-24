import { Controller } from "@nestjs/common";
import { MessagePattern, Payload } from "@nestjs/microservices";
import {
  leadsMessages,
  messages,
  type CreateLeadPayload,
  type FindLeadPayload,
  type LeadDto,
  type OkResponse,
  type RemoveLeadPayload,
  type UpdateLeadPayload,
  type UpdateLeadResponse,
} from "@app/contracts";
import { LeadsService } from "./leads.service";

@Controller()
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @MessagePattern(leadsMessages.leadsFindAll)
  findAll(): Promise<LeadDto[]> {
    return this.leadsService.findAll();
  }
  @MessagePattern(leadsMessages.leadsFindOne)
  findOne(@Payload() payload: FindLeadPayload): Promise<LeadDto> {
    return this.leadsService.findOne(payload);
  }
  @MessagePattern(leadsMessages.leadsCreate)
  create(@Payload() payload: CreateLeadPayload): Promise<LeadDto> {
    return this.leadsService.create(payload);
  }
  @MessagePattern(leadsMessages.leadsUpdate)
  update(@Payload() payload: UpdateLeadPayload): Promise<UpdateLeadResponse> {
    return this.leadsService.update(payload);
  }
  @MessagePattern(leadsMessages.leadsRemove)
  remove(@Payload() payload: RemoveLeadPayload): Promise<OkResponse> {
    return this.leadsService.remove(payload);
  }
}
