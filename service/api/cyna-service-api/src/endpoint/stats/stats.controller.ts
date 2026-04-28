import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { StatsService } from '../../service/stats/stats.service';

@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  /**
   * GET /stats?scope=dashboard|commercial&days=N
   */
  @Get()
  async get(
    @Query('scope') scope?: string,
    @Query('days') days?: string,
  ) {
    const range = days ?? 30;
    if (scope === 'commercial') {
      return this.statsService.getCommercialStats(range);
    }
    if (!scope || scope === 'dashboard') {
      return this.statsService.getDashboardStats(range);
    }
    throw new BadRequestException(`Unknown scope "${scope}"`);
  }
}
