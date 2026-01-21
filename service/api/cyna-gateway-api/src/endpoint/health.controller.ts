import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { HealthService, ServiceHealth } from '../service/health.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({ summary: 'Health check du Gateway et de tous les services' })
  @ApiResponse({ status: 200, description: 'Retourne le statut de tous les services' })
  async checkAll() {
    return this.healthService.checkAll();
  }

  @Get('gateway')
  @ApiOperation({ summary: 'Health check du Gateway uniquement' })
  @ApiResponse({ status: 200, description: 'Retourne le statut du Gateway' })
  check() {
    return this.healthService.checkGateway();
  }

  @Get('bo-api')
  @ApiOperation({ summary: 'Health check du Back-Office API' })
  @ApiResponse({ status: 200, description: 'Retourne le statut du Back-Office API' })
  async checkBoApi(): Promise<ServiceHealth> {
    return this.healthService.checkService('bo-api');
  }

  @Get('service-api')
  @ApiOperation({ summary: 'Health check du Service API' })
  @ApiResponse({ status: 200, description: 'Retourne le statut du Service API' })
  async checkServiceApi(): Promise<ServiceHealth> {
    return this.healthService.checkService('service-api');
  }

  @Get('webapp-api')
  @ApiOperation({ summary: 'Health check du WebApp API' })
  @ApiResponse({ status: 200, description: 'Retourne le statut du WebApp API' })
  async checkWebappApi(): Promise<ServiceHealth> {
    return this.healthService.checkService('webapp-api');
  }
}
