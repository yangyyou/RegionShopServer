import { Module } from '@nestjs/common';
import { RoleService } from './role.service';
import { RoleController } from './role.controller';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Role } from './entities/role.entity';
import { Menu } from '../menu/entities/menu.entity';

@Module({
  imports: [MikroOrmModule.forFeature([Role, Menu])],
  controllers: [RoleController],
  providers: [RoleService],
})
export class RoleModule {}
