import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { MikroOrmConfig } from './mikro-orm.config';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import configuration from './conf/config.dev';
import { SharedModule } from './shared/shared.module';
import { AuthModule } from './auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { AccessTokenGuard } from './auth/accessToken.guard';
import { RoleModule } from './role/role.module';
import { MenuModule } from './menu/menu.module';

@Module({
  imports: [
    MikroOrmModule.forRoot(MikroOrmConfig),
    ConfigModule.forRoot({ load: [configuration], isGlobal: true }),
    UserModule,
    SharedModule,
    AuthModule,
    RoleModule,
    MenuModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // TODO: 测试
    // {
    //   provide: APP_GUARD,
    //   useClass: AccessTokenGuard,
    // },
  ],
})
export class AppModule {}
