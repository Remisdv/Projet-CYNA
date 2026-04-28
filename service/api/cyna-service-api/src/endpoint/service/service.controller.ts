import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ServiceService } from '../../service/service/service.service';
import { CreateServiceDto, UpdateServiceDto, ServiceResponseDto } from '../../service/service/dtos/service.dto';
import { ServiceStatus } from '../../database/entity/service/service.entity';

@Controller('services')
export class ServiceController {
  constructor(private readonly serviceService: ServiceService) { }

  /**
   * GET /services
   * List all services with filtering, pagination, and sorting
   */
  @Get()
  async findAll(
    @Query('page') page?: number,
    @Query('per_page') per_page?: number,
    @Query('categorie') categorie?: string,
    @Query('statut') statut?: ServiceStatus,
    @Query('sort') sort?: string,
  ) {
    return this.serviceService.findAll({
      page,
      per_page,
      categorie,
      statut,
      sort,
    });
  }

  /**
   * GET /services/:id
   * Get service details by ID
   */
  @Get(':id')
  async findById(@Param('id') id: string): Promise<ServiceResponseDto> {
    return this.serviceService.findById(id);
  }

  /**
   * POST /services
   * Create a new service, or duplicate an existing one when ?from=:id is provided.
   */
  @Post()
  async create(
    @Body() createServiceDto: CreateServiceDto,
    @Query('from') from?: string,
  ): Promise<ServiceResponseDto> {
    if (from) {
      return this.serviceService.duplicate(from);
    }
    return this.serviceService.create(createServiceDto);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateServiceDto: UpdateServiceDto,
  ): Promise<ServiceResponseDto> {
    return this.serviceService.update(id, updateServiceDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.serviceService.remove(id);
  }
}
