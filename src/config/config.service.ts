import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';

@Injectable()
export class ConfigService {
  constructor(private configService: NestConfigService) {}

  get(key: string): string {
    return this.configService.get<string>(key);
  }

  getMongoDbUri(): string {
    return this.configService.get<string>('MONGODB_URI');
  }

  getJwtSecret(): string {
    return this.configService.get<string>('JWT_SECRET');
  }

  getPort(): number {
    return Number(this.configService.get<string>('PORT'));
  }
}
