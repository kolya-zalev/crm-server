import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import {
  getPermissionsForRole,
  type LoginPayload,
  type LoginResponse,
  type RegisterPayload,
  type RegisterResponse,
} from "@app/contracts";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(payload: RegisterPayload): Promise<RegisterResponse> {
    const user = await this.prisma.user.findUnique({
      where: { email: payload.email },
    });
    if (user) {
      throw new ConflictException("Email already exists");
    }
    const hashedPassword = await bcrypt.hash(payload.password, 10);
    const newUser = await this.prisma.user.create({
      data: {
        email: payload.email,
        name: payload.name,
        passwordHash: hashedPassword,
      },
    });
    return { id: newUser.id, email: newUser.email, name: newUser.name };
  }

  async login(payload: LoginPayload): Promise<LoginResponse> {
    const user = await this.prisma.user.findUnique({
      where: { email: payload.email },
    });
    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }
    const isPasswordValid = await bcrypt.compare(
      payload.password,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException("Invalid credentials");
    }
    const permissions = getPermissionsForRole(user.role);
    const accessToken = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      permissions,
    });

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        permissions,
      },
    };
  }
}
