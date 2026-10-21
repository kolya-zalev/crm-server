// JsonStorageService — универсальное хранилище в JSON-файлах.
// Каждый ресурс (leads, notes, tasks, activities) хранится в отдельном файле.
// Когда подключишь БД — заменишь ТОЛЬКО этот файл.

import { Injectable } from '@nestjs/common';
import { promises as fs } from 'fs';
import * as path from 'path';

@Injectable()
export class JsonStorageService {
  private readonly dataDir = path.join(process.cwd(), 'data');

  // Создать директорию если нет
  private async ensureDir(): Promise<void> {
    await fs.mkdir(this.dataDir, { recursive: true });
  }

  // Прочитать массив из файла
  async read<T>(filename: string): Promise<T[]> {
    await this.ensureDir();
    const filePath = path.join(this.dataDir, `${filename}.json`);
    try {
      const raw = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(raw) as T[];
    } catch {
      // Файл не существует — вернуть пустой массив
      await fs.writeFile(filePath, '[]', 'utf-8');
      return [];
    }
  }

  // Записать массив в файл
  async write<T>(filename: string, data: T[]): Promise<void> {
    await this.ensureDir();
    const filePath = path.join(this.dataDir, `${filename}.json`);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
  }
}
