import { Controller, Get, Query } from '@nestjs/common';
import { StatsService } from '../../service/stats/stats.service';

@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('dashboard')
  async getDashboard(@Query('days') days?: string) {
    return this.statsService.getDashboardStats(days ?? 30);
  }

  @Get('commercial')
  async getCommercial(@Query('days') days?: string) {
    return this.statsService.getCommercialStats(days ?? 30);
  }
}
