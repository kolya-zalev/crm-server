import { randomUUID } from "node:crypto";
import * as bcrypt from "bcrypt";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { bearer } from "better-auth/plugins";
import { messages } from "@app/contracts";
import { UsersClient } from "../users/users.client";
import { AuthPrismaService } from "./auth-prisma.service";

export const AUTH = "AUTH";

export const createAuth = (prisma: AuthPrismaService, users: UsersClient) =>
  betterAuth({
    secret: process.env.BETTER_AUTH_SECRET,
    baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3001",
    basePath: "/api/auth",
    trustedOrigins: [process.env.FRONTEND_URL ?? "http://localhost:3000"],
    database: prismaAdapter(prisma, { provider: "postgresql" }),
    advanced: {
      database: { generateId: () => randomUUID() },
    },
    emailAndPassword: {
      enabled: true,
      password: {
        hash: (password) => bcrypt.hash(password, 10),
        verify: ({ hash, password }) => bcrypt.compare(password, hash),
      },
    },
    user: {
      additionalFields: {
        role: {
          type: "string",
          required: true,
          defaultValue: "member",
          input: false,
        },
      },
    },
    databaseHooks: {
      user: {
        create: {
          after: async (user) => {
            await users.send(messages.usersUpsert, {
              id: user.id,
              email: user.email,
              name: user.name,
              role: user.role as string,
            });
          },
        },
      },
    },
    plugins: [bearer()],
  });

export type Auth = ReturnType<typeof createAuth>;
