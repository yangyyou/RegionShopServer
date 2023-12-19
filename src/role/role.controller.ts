import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { RoleService } from './role.service';
import { CreateRoleDto, IdRoleDto, UpdateRoleDto } from './role.dto';

@Controller('role')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post('create')
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.roleService.create(createRoleDto);
  }

  @Get('list')
  findAll() {
    return this.roleService.findAll();
  }

  @Post('get')
  findOne(@Body() idDto: IdRoleDto) {
    return this.roleService.findOne(idDto.id);
  }

  @Post('update')
  update(@Body() updateRoleDto: UpdateRoleDto) {
    return this.roleService.update(updateRoleDto.id, updateRoleDto);
  }

  @Post('delete')
  remove(@Body() idDto: IdRoleDto) {
    return this.roleService.remove(idDto.id);
  }
}
