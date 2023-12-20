import { Controller, Get, Post, Body, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { Request } from 'express';
import { CreateUserDto, IdUserDto, UpdateUserDto } from './dto/user.dto';
import { AccessTokenGuard } from '../auth/accessToken.guard';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('create')
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  // 获取所有用户
  @UseGuards(AccessTokenGuard)
  @Get('list')
  findAll() {
    return this.userService.findAll();
  }

  // 获取某个用户信息
  @Get('profile')
  getProfile(@Req() req: Request) {
    return this.userService.findOne(req.user['sub']);
  }

  @Post('get')
  findOne(@Body() idDto: IdUserDto) {
    return this.userService.findOne(idDto.id);
  }

  @Post('update')
  update(@Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(updateUserDto);
  }

  @Post('delete')
  remove(@Body() idDto: IdUserDto) {
    return this.userService.remove(idDto.id);
  }
}
