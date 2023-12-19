import { Module } from '@nestjs/common';
import { MenuService } from './menu.service';
import { MenuController } from './menu.controller';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Menu } from './entities/menu.entity';

@Module({
  imports: [MikroOrmModule.forFeature([Menu])],
  controllers: [MenuController],
  providers: [MenuService],
})
export class MenuModule {}
