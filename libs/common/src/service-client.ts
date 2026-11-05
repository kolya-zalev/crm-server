import {
  HttpException,
  InternalServerErrorException,
  Logger,
  ServiceUnavailableException,
} from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { firstValueFrom, timeout, TimeoutError } from "rxjs";

const serviceTimeoutMs = 5000;

type Contract = Record<string, { payload: unknown; response: unknown }>;

type RpcError = { statusCode: number; message?: unknown };

const isRpcError = (error: unknown): error is RpcError =>
  typeof error === "object" &&
  error !== null &&
  typeof (error as { statusCode?: unknown }).statusCode === "number";

// сетевые ошибки «до сервиса не достучаться»:
// локально — ECONNREFUSED (порт никто не слушает),
// в Docker — ENOTFOUND / EAI_AGAIN (остановленного контейнера нет в DNS сети)
const connectionErrorCodes = new Set([
  "ECONNREFUSED",
  "ECONNRESET",
  "ENOTFOUND",
  "EAI_AGAIN",
  "EHOSTUNREACH",
]);

const isConnectionError = (error: unknown): boolean => {
  const code = (error as { code?: unknown } | null)?.code;
  return typeof code === "string" && connectionErrorCodes.has(code);
};

export class ServiceClient<TContract extends Contract> {
  private readonly logger: Logger;

  constructor(
    protected readonly client: ClientProxy,
    private readonly serviceName: string,
  ) {
    this.logger = new Logger(`${serviceName} client`);
  }

  async send<K extends keyof TContract & string>(
    pattern: K,
    payload: TContract[K]["payload"],
  ): Promise<TContract[K]["response"]> {
    try {
      return await firstValueFrom(
        this.client
          .send<TContract[K]["response"]>(pattern, payload)
          .pipe(timeout(serviceTimeoutMs)),
      );
    } catch (error) {
      throw this.toHttpException(pattern, error);
    }
  }

  private toHttpException(pattern: string, error: unknown): HttpException {
    if (isRpcError(error)) {
      return new HttpException(error, error.statusCode);
    }

    if (error instanceof TimeoutError || isConnectionError(error)) {
      this.logger.warn(`${this.serviceName} unavailable (${pattern})`);
      return new ServiceUnavailableException(
        `${this.serviceName} unavailable`,
      );
    }

    this.logger.error(`${this.serviceName} failed (${pattern})`, error as Error);
    return new InternalServerErrorException();
  }
}
