import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Request } from 'express';
import { RefreshTokenGuard } from './refreshToken.guard';
import { Public } from './auth.decorator';
import { CreateUserDto, LoginUserDto } from '../user/dto/user.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('auth认证模块')
@Controller('auth')
export class AuthController {
  constructor(private readonly authSer: AuthService) {}

  @Public()
  @Post('signup')
  signup(@Body() createUserDto: CreateUserDto) {
    return this.authSer.signup(createUserDto);
  }

  @Public()
  @Post('login')
  login(@Body() loginUserDto: LoginUserDto) {
    return this.authSer.login(loginUserDto);
  }

  @Post('logout')
  logout(@Req() req: Request) {
    this.authSer.logout(req.user['sub']);
  }

  @Public()
  @UseGuards(RefreshTokenGuard)
  @Post('refresh')
  refresh_token(@Req() req: Request) {
    console.log(req.user);
    return this.authSer.refreshToken(
      req.user['sub'],
      req.user['username'],
      req.user['refresh_token'],
    );
  }
}
