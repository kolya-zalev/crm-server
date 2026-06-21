import {
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Role, User, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

type SanitizedUser = {
  id: string;
  email: string;
  name: string;
  role: Role;
  status: User['status'];
  workspaceId: string;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) {
      if (existing.status === UserStatus.invited) {
        const passwordHash = await bcrypt.hash(dto.password, 10);
        const user = await this.prisma.user.update({
          where: { id: existing.id },
          data: {
            passwordHash,
            name: dto.name,
            status: UserStatus.active,
          },
        });

        return {
          accessToken: this.signToken(user),
          user: this.sanitizeUser(user),
        };
      }

      throw new ConflictException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const userCount = await this.prisma.user.count();

    let role: Role = Role.sales;
    let workspaceId: string;

    if (userCount === 0) {
      role = Role.admin;
      const workspace = await this.prisma.workspace.create({
        data: { name: 'Default' },
      });
      workspaceId = workspace.id;
    } else {
      const workspace = await this.prisma.workspace.findFirst();
      if (!workspace) {
        throw new ConflictException('No workspace available');
      }
      workspaceId = workspace.id;
    }

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        name: dto.name,
        role,
        workspaceId,
      },
    });

    return {
      accessToken: this.signToken(user),
      user: this.sanitizeUser(user),
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.status === 'disabled') {
      throw new ForbiddenException('Account is disabled');
    }

    return {
      accessToken: this.signToken(user),
      user: this.sanitizeUser(user),
    };
  }

  async getProfile(userId: string): Promise<SanitizedUser> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException();
    }

    return this.sanitizeUser(user);
  }

  private signToken(user: User): string {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      workspaceId: user.workspaceId,
    };
    return this.jwtService.sign(payload);
  }

  private sanitizeUser(user: User): SanitizedUser {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      status: user.status,
      workspaceId: user.workspaceId,
    };
  }
}
