import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AccessTokenStrategy } from './accessToken.strategy';
import { RefreshTokenStrategy } from './refreshToken.strategy';
import { AuthController } from './auth.controller';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { User } from 'src/user/entities/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { Role } from '../role/entities/role.entity';
import { Menu } from '../menu/entities/menu.entity';

@Module({
  imports: [
    MikroOrmModule.forFeature([User, Role, Menu]),
    JwtModule.register({}),
  ],
  providers: [AuthService, AccessTokenStrategy, RefreshTokenStrategy],
  exports: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
