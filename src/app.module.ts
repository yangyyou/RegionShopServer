import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { MikroOrmConfig } from './mikro-orm.config';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import configuration from './conf/config.dev';
import { SharedModule } from './shared/shared.module';

@Module({
  imports: [
    MikroOrmModule.forRoot(MikroOrmConfig),
    ConfigModule.forRoot({ load: [configuration], isGlobal: true }),
    UserModule,
    SharedModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
