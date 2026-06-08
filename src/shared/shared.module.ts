import { Global, Module } from '@nestjs/common';
import { JsonStorageService } from './json-storage.service';

@Global() // Global = доступен во всех модулях без импорта
@Module({
  providers: [JsonStorageService],
  exports: [JsonStorageService],
})
export class SharedModule {}
