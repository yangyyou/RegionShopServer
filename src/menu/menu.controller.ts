import { Controller, Get, Post, Body, Delete } from '@nestjs/common';
import { MenuService } from './menu.service';

import { CreateMenuDto, IdMenuDto, UpdateMenuDto } from './menu.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('menu菜单模块')
@Controller('menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Post()
  create(@Body() createMenuDto: CreateMenuDto) {
    return this.menuService.create(createMenuDto);
  }

  @Get('list')
  findAll() {
    return this.menuService.findAll();
  }

  @Post('get')
  findOne(@Body() getMenuDto: IdMenuDto) {
    return this.menuService.findOne(getMenuDto.id);
  }

  @Post('update')
  update(@Body() updateMenuDto: UpdateMenuDto) {
    return this.menuService.update(updateMenuDto.id, updateMenuDto);
  }

  @Post('delete')
  remove(@Body() delMenuDto: IdMenuDto) {
    return this.menuService.remove(delMenuDto.id);
  }
}
