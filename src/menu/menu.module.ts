import { Module } from '@nestjs/common';
import { MenuService } from './menu.service';
import { MenuController } from './menu.controller';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Menu } from './entities/menu.entity';
import { Role } from '../role/entities/role.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [MikroOrmModule.forFeature([Menu, Role]), AuthModule],
  controllers: [MenuController],
  providers: [MenuService],
})
export class MenuModule {}
