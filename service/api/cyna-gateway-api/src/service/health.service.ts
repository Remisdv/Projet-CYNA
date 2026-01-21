import { Injectable, HttpException, HttpStatus } from '@nestjs/common';

interface ServiceConfig {
  name: string;
  url: string;
}

export interface ServiceHealth {
  status: string;
  service: string;
  timestamp?: string;
  database?: {
    status: string;
  };
  error?: string;
}

@Injectable()
export class HealthService {
  private readonly services: ServiceConfig[] = [
    {
      name: 'cyna-bo-api',
      url: process.env.BO_API_URL || 'http://cyna-bo-api:3000',
    },
    {
      name: 'cyna-service-api',
      url: process.env.SERVICE_API_URL || 'http://cyna-service-api:3000',
    },
    {
      name: 'cyna-webapp-api',
      url: process.env.WEBAPP_API_URL || 'http://cyna-webapp-api:3000',
    },
  ];

  checkGateway() {
    return {
      status: 'ok',
      service: 'cyna-gateway-api',
      timestamp: new Date().toISOString(),
    };
  }

  async checkService(serviceKey: string): Promise<ServiceHealth> {
    const serviceMap: Record<string, ServiceConfig> = {
      'bo-api': this.services[0],
      'service-api': this.services[1],
      'webapp-api': this.services[2],
    };

    const service = serviceMap[serviceKey];
    if (!service) {
      throw new HttpException('Service not found', HttpStatus.NOT_FOUND);
    }

    try {
      const response = await fetch(`${service.url}/health`);
      const data = await response.json();
      return data;
    } catch (error) {
      return {
        status: 'error',
        service: service.name,
        error: `Service unreachable: ${error.message}`,
      };
    }
  }

  async checkAll() {
    const gateway = this.checkGateway();

    const servicesHealth = await Promise.all(
      this.services.map(async (service) => {
        try {
          const response = await fetch(`${service.url}/health`);
          const data = await response.json();
          return data;
        } catch (error) {
          return {
            status: 'error',
            service: service.name,
            error: `Service unreachable: ${error.message}`,
          };
        }
      }),
    );

    const allServicesOk = servicesHealth.every((s) => s.status === 'ok');

    return {
      status: allServicesOk ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      services: {
        gateway,
        'bo-api': servicesHealth[0],
        'service-api': servicesHealth[1],
        'webapp-api': servicesHealth[2],
      },
    };
  }
}
