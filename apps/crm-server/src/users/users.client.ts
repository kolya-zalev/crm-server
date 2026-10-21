import {
  HttpException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  ServiceUnavailableException,
} from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { firstValueFrom, timeout, TimeoutError } from "rxjs";
import { USERS_SERVICE, type UsersContract } from "@app/contracts";

const usersServiceTimeoutMs = 5000;

type RpcError = { statusCode: number; message?: unknown };

const isRpcError = (error: unknown): error is RpcError =>
  typeof error === "object" &&
  error !== null &&
  typeof (error as { statusCode?: unknown }).statusCode === "number";

@Injectable()
export class UsersClient {
  private readonly logger = new Logger(UsersClient.name);

  constructor(@Inject(USERS_SERVICE) private readonly client: ClientProxy) {}

  async send<K extends keyof UsersContract>(
    pattern: K,
    payload: UsersContract[K]["payload"],
  ): Promise<UsersContract[K]["response"]> {
    try {
      return await firstValueFrom(
        this.client
          .send<UsersContract[K]["response"]>(pattern, payload)
          .pipe(timeout(usersServiceTimeoutMs)),
      );
    } catch (error) {
      throw this.toHttpException(pattern, error);
    }
  }

  private toHttpException(pattern: string, error: unknown): HttpException {
    if (isRpcError(error)) {
      return new HttpException(error, error.statusCode);
    }

    const isConnectionRefused =
      (error as { code?: string } | null)?.code === "ECONNREFUSED";
    if (error instanceof TimeoutError || isConnectionRefused) {
      this.logger.warn(`users-service unavailable (${pattern})`);
      return new ServiceUnavailableException("Users service unavailable");
    }

    this.logger.error(`users-service failed (${pattern})`, error as Error);
    return new InternalServerErrorException();
  }
}
