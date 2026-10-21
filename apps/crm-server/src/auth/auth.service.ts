import { Injectable } from "@nestjs/common";
import {
  messages,
  type LoginResponse,
  type RegisterResponse,
} from "@app/contracts";
import { UsersClient } from "../users/users.client";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";

@Injectable()
export class AuthService {
  constructor(private readonly users: UsersClient) {}

  register(dto: RegisterDto): Promise<RegisterResponse> {
    return this.users.send(messages.authRegister, dto);
  }

  login(dto: LoginDto): Promise<LoginResponse> {
    return this.users.send(messages.authLogin, dto);
  }
}
