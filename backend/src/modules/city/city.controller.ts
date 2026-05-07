import { Controller, Get, Param } from '@nestjs/common';
import { CityService } from './city.service';

@Controller('cities')
export class CityController {
  constructor(private readonly cityService: CityService) {}

  @Get()
  async findAll() {
    return this.cityService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.cityService.findOne(id);
  }
}
