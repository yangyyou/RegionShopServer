import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { AuthService } from './auth.service';
import { LoginUserDto } from 'src/user/dto/login_user.dto';
import { Request } from 'express';
import { RefreshTokenGuard } from './refreshToken.guard';
import { AccessTokenGuard } from './accessToken.guard';
import { Public } from './auth.decorator';

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

  // @UseGuards(AccessTokenGuard)
  @Post('ac_test')
  test() {
    return 'access token success';
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
