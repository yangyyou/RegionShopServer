import { OmitType, PartialType, PickType } from '@nestjs/mapped-types';
import {
  IsArray,
  IsEmail,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Matches,
  Max,
  Min,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @Length(8, 16)
  username!: string;

  @IsString()
  @Length(6, 20)
  password!: string;

  @IsArray()
  @IsOptional()
  roles: number[];

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsNumber()
  @IsOptional()
  @Min(5)
  @Max(100)
  age: number;

  @IsString()
  @IsOptional()
  @Matches(/^1[35789][0-9]{9}$/, {
    message: '请输入正确的手机号',
  })
  phone?: string;
}

export class UpdateUserDto extends OmitType(CreateUserDto, [
  'username',
  'password',
]) {
  @IsNumber()
  id: number;
}

export class LoginUserDto extends PickType(CreateUserDto, [
  'username',
  'password',
]) {}

export class IdUserDto {
  @IsNumber()
  id: number;
}
