import { Controller } from "@nestjs/common";
import { MessagePattern, Payload } from "@nestjs/microservices";
import {
  messages,
  type LoginPayload,
  type LoginResponse,
  type RegisterPayload,
  type RegisterResponse,
} from "@app/contracts";
import { AuthService } from "./auth.service";

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern(messages.authRegister)
  register(@Payload() payload: RegisterPayload): Promise<RegisterResponse> {
    return this.authService.register(payload);
  }

  @MessagePattern(messages.authLogin)
  login(@Payload() payload: LoginPayload): Promise<LoginResponse> {
    return this.authService.login(payload);
  }
}
