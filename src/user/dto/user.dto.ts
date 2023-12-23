import { PickType } from '@nestjs/mapped-types';
import { ApiProperty, PartialType, OmitType } from '@nestjs/swagger';
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
  /***
   * 创建用户名
   * @example: user
   */
  @ApiProperty()
  @IsString()
  @Length(8, 16)
  username!: string;

  @ApiProperty()
  @IsString()
  @Length(6, 20)
  password!: string;

  @ApiProperty()
  @IsArray()
  @IsOptional()
  roles: number[];

  @ApiProperty()
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  @Min(5)
  @Max(100)
  age?: number;

  /**
   * 手机号
   */
  @ApiProperty()
  @IsString()
  @IsOptional()
  @Matches(/^1[35789][0-9]{9}$/, {
    message: '请输入正确的手机号',
  })
  phone?: string;
}

export class UpdateUserDto extends PartialType(
  OmitType(CreateUserDto, ['username', 'password']),
) {
  @ApiProperty({ name: '用户id' })
  @IsNumber()
  id: number;
}

export class LoginUserDto extends PickType(CreateUserDto, [
  'username',
  'password',
]) {}

export class IdUserDto {
  @ApiProperty()
  @IsNumber()
  id: number;
}
