import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CompanyTypeService } from './company-type.service';
import { CreateCompanyTypeDto } from './dto/create-company-type.dto';
import { UpdateCompanyTypeDto } from './dto/update-company-type.dto';

@Controller('company-type')
export class CompanyTypeController {
  constructor(private readonly companyTypeService: CompanyTypeService) {}

  @Post()
  create(@Body() createCompanyTypeDto: CreateCompanyTypeDto) {
    return this.companyTypeService.create(createCompanyTypeDto);
  }

  @Get()
  findAll() {
    return this.companyTypeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.companyTypeService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCompanyTypeDto: UpdateCompanyTypeDto) {
    return this.companyTypeService.update(+id, updateCompanyTypeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.companyTypeService.remove(+id);
  }
}
