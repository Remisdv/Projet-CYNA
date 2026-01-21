import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class HealthService {
  constructor(private readonly dataSource: DataSource) {}

  async check() {
    const health = {
      status: 'ok',
      service: 'cyna-bo-api',
      timestamp: new Date().toISOString(),
      database: {
        status: 'ok',
      },
    };

    try {
      await this.dataSource.query('SELECT 1');
    } catch (error) {
      health.status = 'error';
      health.database.status = 'error';
    }

    return health;
  }
}
