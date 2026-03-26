import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { ServiceEntity, ServiceStatus } from '../../database/entity/service/service.entity';
import { CreateServiceDto, UpdateServiceDto, ServiceResponseDto } from '../../dto/service/service.dto';

@Injectable()
export class ServiceService {
  constructor(
    @InjectRepository(ServiceEntity)
    private serviceRepository: Repository<ServiceEntity>,
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

    while (await this.serviceRepository.findOneBy({ slug })) {
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
      const existingService = await this.serviceRepository.findOneBy({ slug: service.slug });
      if (existingService) {
        throw new ConflictException(`Un service avec le slug ${service.slug} existe déjà`);
      }
    }

    // Default status
    if (!service.statut) {
      service.statut = ServiceStatus.DRAFT;
    }

    const saved = await this.serviceRepository.save(service);
    return this.mapToResponseDto(saved);
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
    const skip = (page - 1) * per_page;

    let queryBuilder = this.serviceRepository.createQueryBuilder('service');

    // Apply filters
    if (query.categorie) {
      queryBuilder = queryBuilder.andWhere('service.categoryId = :categorie', {
        categorie: query.categorie,
      });
    }

    if (query.statut) {
      queryBuilder = queryBuilder.andWhere('service.statut = :statut', {
        statut: query.statut,
      });
    }

    // Apply sorting
    if (query.sort) {
      const [field, direction] = query.sort.split(':');
      queryBuilder = queryBuilder.orderBy(`service.${field}`, (direction?.toUpperCase() as 'ASC' | 'DESC') || 'ASC');
    } else {
      queryBuilder = queryBuilder.orderBy('service.createdAt', 'DESC');
    }

    // Apply pagination
    queryBuilder = queryBuilder.skip(skip).take(per_page);

    const [services, total] = await queryBuilder.getManyAndCount();

    return {
      data: services.map(service => this.mapToResponseDto(service)),
      total,
      page,
      per_page,
    };
  }

  /**
   * Get service by ID
   */
  async findById(id: string): Promise<ServiceResponseDto> {
    const service = await this.serviceRepository.findOneBy({ id });
    if (!service) {
      throw new NotFoundException(`Service avec l'id ${id} introuvable`);
    }
    return this.mapToResponseDto(service);
  }

  /**
   * Update a service
   */
  async update(id: string, updateServiceDto: UpdateServiceDto): Promise<ServiceResponseDto> {
    const service = await this.serviceRepository.findOneBy({ id });
    if (!service) {
      throw new NotFoundException(`Service avec l'id ${id} introuvable`);
    }

    // Verify slug uniqueness if changed
    if (updateServiceDto.slug && updateServiceDto.slug !== service.slug) {
      const existingService = await this.serviceRepository.findOneBy({ slug: updateServiceDto.slug });
      if (existingService) {
        throw new ConflictException(`Un service avec le slug ${updateServiceDto.slug} existe déjà`);
      }
    }

    Object.assign(service, updateServiceDto);
    const saved = await this.serviceRepository.save(service);
    return this.mapToResponseDto(saved);
  }

  /**
   * Delete a service
   */
  async remove(id: string): Promise<void> {
    const result = await this.serviceRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Service avec l'id ${id} introuvable`);
    }
  }

  /**
   * Duplicate a service
   */
  async duplicate(id: string): Promise<ServiceResponseDto> {
    const originalService = await this.serviceRepository.findOneBy({ id });
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
    return this.mapToResponseDto(saved);
  }

  /**
   * Map entity to response DTO
   */
  private mapToResponseDto(entity: ServiceEntity): ServiceResponseDto {
    return {
      id: entity.id,
      nom: entity.nom,
      categoryId: entity.categoryId,
      description: entity.description,
      statut: entity.statut,
      slug: entity.slug,
      meta_title: entity.meta_title,
      meta_description: entity.meta_description,
      keywords: entity.keywords,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
