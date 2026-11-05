import { Inject, Injectable } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { ServiceClient } from "@app/common";
import { USERS_SERVICE, type UsersContract } from "@app/contracts";

@Injectable()
export class UsersClient extends ServiceClient<UsersContract> {
  constructor(@Inject(USERS_SERVICE) client: ClientProxy) {
    super(client, "users-service");
  }
}
