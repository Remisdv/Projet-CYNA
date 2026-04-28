import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { ServiceEntity, ServiceStatus } from '../../database/entity/service/service.entity';
import { ServiceRepository } from '../../repository/service/service.repository';
import { ServiceMapper } from './mappers/service.mapper';
import { CreateServiceDto, UpdateServiceDto, ServiceResponseDto } from './dtos/service.dto';

@Injectable()
export class ServiceService {
  constructor(
    private readonly serviceRepository: ServiceRepository,
    private readonly mapper: ServiceMapper,
  ) {}

  /**
   * Generate a slug from the service name
   */
  private generateSlug(nom: string): string {
    return nom
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  /**
   * Generate a unique slug
   */
  private async generateUniqueSlug(nom: string): Promise<string> {
    let slug = this.generateSlug(nom);
    let counter = 1;

    while (await this.serviceRepository.findBySlug(slug)) {
      slug = `${this.generateSlug(nom)}-${counter}`;
      counter++;
    }

    return slug;
  }

  /**
   * Create a new service
   */
  async create(createServiceDto: CreateServiceDto): Promise<ServiceResponseDto> {
    const service = new ServiceEntity();

    Object.assign(service, createServiceDto);

    // Generate slug if not provided
    if (!service.slug) {
      service.slug = await this.generateUniqueSlug(service.nom);
    } else {
      // Verify slug uniqueness
      const existingService = await this.serviceRepository.findBySlug(service.slug);
      if (existingService) {
        throw new ConflictException(`Un service avec le slug ${service.slug} existe déjà`);
      }
    }

    // Default status
    if (!service.statut) {
      service.statut = ServiceStatus.DRAFT;
    }

    const saved = await this.serviceRepository.save(service);
    return this.mapper.toDto(saved);
  }

  /**
   * Get all services with filtering and pagination
   */
  async findAll(query: {
    page?: number;
    per_page?: number;
    categorie?: string;
    statut?: ServiceStatus;
    sort?: string;
  }): Promise<{
    data: ServiceResponseDto[];
    total: number;
    page: number;
    per_page: number;
  }> {
    const page = query.page || 1;
    const per_page = query.per_page || 20;

    const { data, total } = await this.serviceRepository.findFiltered({
      page,
      per_page,
      categorie: query.categorie,
      statut: query.statut,
      sort: query.sort,
    });

    return {
      data: this.mapper.toDtoArray(data),
      total,
      page,
      per_page,
    };
  }

  /**
   * Get service by ID
   */
  async findById(id: string): Promise<ServiceResponseDto> {
    const service = await this.serviceRepository.findById(id);
    if (!service) {
      throw new NotFoundException(`Service avec l'id ${id} introuvable`);
    }
    return this.mapper.toDto(service);
  }

  /**
   * Update a service
   */
  async update(id: string, updateServiceDto: UpdateServiceDto): Promise<ServiceResponseDto> {
    const service = await this.serviceRepository.findById(id);
    if (!service) {
      throw new NotFoundException(`Service avec l'id ${id} introuvable`);
    }

    // Verify slug uniqueness if changed
    if (updateServiceDto.slug && updateServiceDto.slug !== service.slug) {
      const existingService = await this.serviceRepository.findBySlug(updateServiceDto.slug);
      if (existingService) {
        throw new ConflictException(`Un service avec le slug ${updateServiceDto.slug} existe déjà`);
      }
    }

    Object.assign(service, updateServiceDto);
    const saved = await this.serviceRepository.save(service);
    return this.mapper.toDto(saved);
  }

  /**
   * Delete a service
   */
  async remove(id: string): Promise<void> {
    const affected = await this.serviceRepository.deleteById(id);
    if (affected === 0) {
      throw new NotFoundException(`Service avec l'id ${id} introuvable`);
    }
  }

  /**
   * Duplicate a service
   */
  async duplicate(id: string): Promise<ServiceResponseDto> {
    const originalService = await this.serviceRepository.findById(id);
    if (!originalService) {
      throw new NotFoundException(`Service avec l'id ${id} introuvable`);
    }

    const newService = new ServiceEntity();
    newService.id = uuidv4();
    newService.nom = `${originalService.nom} (Copy)`;
    newService.categoryId = originalService.categoryId;
    newService.description = originalService.description;
    newService.statut = ServiceStatus.DRAFT;
    newService.slug = await this.generateUniqueSlug(newService.nom);
    newService.meta_title = originalService.meta_title;
    newService.meta_description = originalService.meta_description;
    newService.keywords = originalService.keywords;

    const saved = await this.serviceRepository.save(newService);
    return this.mapper.toDto(saved);
  }
}
