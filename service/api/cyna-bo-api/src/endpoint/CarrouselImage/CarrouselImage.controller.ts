import { Controller, Delete, Get, Post, Body, Patch, Param, ParseIntPipe } from "@nestjs/common";
import { CarrouselImageService } from '../../service/CarrouselImage/CarrouselImage.service';
import { CreateUpdateCarrouselImageDto, CarrouselImageDto } from '../../service/dtos/CarrouselImage.dto';

@Controller('carrousel-image')
export class CarrouselImageController {
    constructor(private readonly carrouselImageService: CarrouselImageService) {}

    @Get()
    getAll(): Promise<CarrouselImageDto[]> {
        return this.carrouselImageService.findAll();
    }

    @Get('active')
    getActive(): Promise<CarrouselImageDto[]> {
        return this.carrouselImageService.findActive();
    }

    @Get(':id')
    getById(@Param('id', ParseIntPipe) id: number): Promise<CarrouselImageDto> {
        return this.carrouselImageService.findOne(id);
    }

    @Post()
    create(@Body() data: CreateUpdateCarrouselImageDto): Promise<CarrouselImageDto> {
        return this.carrouselImageService.create(data);
    }

    @Patch(':id')
    update(@Param('id', ParseIntPipe) id: number, @Body() data: CreateUpdateCarrouselImageDto): Promise<CarrouselImageDto> {
        return this.carrouselImageService.update(id, data);
    }

    @Delete(':id')
    delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
        return this.carrouselImageService.remove(id);
    }
}