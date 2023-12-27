import { Controller, Get, Post, Body } from '@nestjs/common';
import { ParamsService } from './params.service';
import { CreateParamDto, InfoParamDto, UpdateParamDto } from './dto/params.dto';

@Controller('params')
export class ParamsController {
  constructor(private readonly paramsService: ParamsService) {}

  @Post('create')
  create(@Body() createParamDto: CreateParamDto) {
    return this.paramsService.create(createParamDto);
  }

  @Get('list')
  findAll() {
    return this.paramsService.findAll();
  }

  @Post('get')
  findOne(@Body() idDto: InfoParamDto) {
    return this.paramsService.findOne(idDto.id);
  }

  @Post('update')
  update(@Body() updateParamDto: UpdateParamDto) {
    return this.paramsService.update(updateParamDto.id, updateParamDto);
  }

  @Post('delete')
  remove(@Body() IdDto: InfoParamDto) {
    return this.paramsService.remove(IdDto.id);
  }
}
