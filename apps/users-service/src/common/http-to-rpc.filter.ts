import {
  ArgumentsHost,
  Catch,
  HttpException,
  RpcExceptionFilter,
} from "@nestjs/common";
import { Observable, throwError } from "rxjs";

@Catch(HttpException)
export class HttpToRpcExceptionFilter implements RpcExceptionFilter<HttpException> {
  catch(exception: HttpException, _host: ArgumentsHost): Observable<never> {
    const statusCode = exception.getStatus();

    const response = exception.getResponse();
    const body =
      typeof response === "string" ? { message: response } : response;

    return throwError(() => ({ ...body, statusCode }));
  }
}
