import { Injectable } from '@nestjs/common';
import { ProductEntity, ProductType } from '../../../database/entity/product';
import { ProductResponseDto } from '../dtos/product.dto';

@Injectable()
export class ProductMapper {
    toDto(entity: ProductEntity): ProductResponseDto {
        const dto = new ProductResponseDto();
        Object.assign(dto, entity);

        // Handle stock display
        if (entity.type === ProductType.PRODUCT) {
            dto.stock = entity.stock_illimite === 'illimit\u00e9' ? 'illimit\u00e9' : entity.stock;
        }

        return dto;
    }

    toDtoArray(entities: ProductEntity[]): ProductResponseDto[] {
        return entities.map((e) => this.toDto(e));
    }
}
