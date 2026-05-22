import { Controller, Get, Param } from '@nestjs/common';
import { TagService } from './tag.service';

@Controller('tags')
export class TagController {
  constructor(private readonly tagService: TagService) {}

  @Get()
  async findAll() {
    return this.tagService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.tagService.findOne(id);
  }
}
