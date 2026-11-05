import { Inject, Injectable } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { ServiceClient } from "@app/common";
import { LEADS_SERVICE, type LeadsContract } from "@app/contracts";

@Injectable()
export class LeadsClient extends ServiceClient<LeadsContract> {
  constructor(@Inject(LEADS_SERVICE) client: ClientProxy) {
    super(client, "leads-service");
  }
}
