import { Optional } from '@nestjs/common';
import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Max,
} from 'class-validator';
import { MENU_TYPE } from './menu.constant';
import { PartialType } from '@nestjs/mapped-types';

export class CreateMenuDto {
  @IsString()
  name: string;

  @IsNumber()
  @IsOptional()
  parent_id: number;

  @IsArray()
  @IsOptional()
  children_id: number[];

  @IsString()
  @IsOptional()
  remark: string;

  @IsString()
  @Matches(/^[^/\\]+$/, { message: '路由中不能存在/ 或者\\ 字符' })
  router: string;

  @IsNumber()
  @Optional()
  @Max(255)
  sort: number;

  @IsString()
  @Optional()
  icon: string;

  @IsString()
  type: MENU_TYPE;

  @IsBoolean()
  @IsOptional()
  enable: boolean;

  @IsBoolean()
  @IsOptional()
  hidden: boolean;
}

export class UpdateMenuDto extends PartialType(CreateMenuDto) {
  @IsNumber()
  id: number;
}

export class IdMenuDto {
  @IsNumber()
  id: number;
}
