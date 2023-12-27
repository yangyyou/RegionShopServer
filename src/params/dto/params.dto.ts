import { PartialType } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateParamDto {
  @IsString()
  key: string;

  @IsString()
  @IsOptional()
  value?: string;

  @IsOptional()
  @IsString()
  remark?: string;
}

export class UpdateParamDto extends PartialType(CreateParamDto) {
  @IsNumber()
  id: number;
}

export class InfoParamDto {
  @IsNumber()
  id: number;
}
