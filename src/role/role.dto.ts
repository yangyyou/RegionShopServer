import { PartialType } from '@nestjs/mapped-types';
import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateRoleDto {
  @IsString()
  name: string;

  @IsString()
  remark: string;

  @IsArray()
  @IsOptional()
  access_menus?: number[];
}

export class UpdateRoleDto extends PartialType(CreateRoleDto) {
  @IsNumber()
  id!: number;
}

export class IdRoleDto {
  @IsNumber()
  id!: number;
}
