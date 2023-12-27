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
import { RoleModule } from './role/role.module';
import { MenuModule } from './menu/menu.module';
import { ParamsModule } from './params/params.module';

@Module({
  imports: [
    MikroOrmModule.forRoot(MikroOrmConfig),
    ConfigModule.forRoot({ load: [configuration], isGlobal: true }),
    UserModule,
    SharedModule,
    AuthModule,
    RoleModule,
    MenuModule,
    ParamsModule,
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
