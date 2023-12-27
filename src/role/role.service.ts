import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateRoleDto, UpdateRoleDto } from './role.dto';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Role } from './entities/role.entity';
import { EntityManager, EntityRepository, rel, wrap } from '@mikro-orm/core';
import { Menu } from '../menu/entities/menu.entity';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepo: EntityRepository<Role>,
    @InjectRepository(Menu)
    private readonly menuRepo: EntityRepository<Menu>,
    private readonly em: EntityManager,
    private readonly authSer: AuthService,
  ) {}

  async create(createRoleDto: CreateRoleDto) {
    // 检查名字唯一
    const exist = await this.roleRepo.count({ name: createRoleDto.name });
    if (exist) throw new BadRequestException('存在重复角色名称');

    // 创建实例并写入数据库
    const newRole = this.roleRepo.create({
      name: createRoleDto.name,
      remark: createRoleDto.remark,
    });

    for (let i = 0; i < createRoleDto.access_menus.length; i++) {
      const menu = await this.menuRepo.findOne({
        id: createRoleDto.access_menus[i],
      });
      if (!menu) throw new BadRequestException('添加权限不存在');
      newRole.access_menus.add(menu);
    }

    await this.em.persistAndFlush(newRole);
    this.authSer.cacheUpdateRoleMenu(newRole.id);
    return { ...newRole, access_menus: createRoleDto.access_menus };
  }

  findAll() {
    return this.roleRepo.findAll({
      fields: [
        'id',
        'name',
        'remark',
        'access_menus.id',
        'access_menus.name',
        'access_menus.router',
      ],
    });
  }

  findOne(id: number) {
    const role = this.roleRepo.findOne(
      { id: id },
      {
        fields: ['id', 'name', 'remark', 'access_menus'],
      },
    );
    if (!role) throw new BadRequestException('角色不存在');
    return role;
  }

  async update(id: number, updateRoleDto: UpdateRoleDto) {
    const role = await this.roleRepo.findOne(
      { id: id },
      { populate: ['access_menus'] },
    );
    if (!role) throw new BadRequestException('角色不存在');

    // 如果添加权限，检查是否存在
    if (updateRoleDto.access_menus) {
      role.access_menus.removeAll();
      for (let i = 0; i < updateRoleDto.access_menus.length; i++) {
        const menu_id = updateRoleDto.access_menus[i];
        const menu = await this.menuRepo.findOne({ id: menu_id });
        if (!menu) throw new BadRequestException(`菜单${menu_id}不存在`);
        role.access_menus.add(menu);
      }
      console.log('更新menu');
    }

    wrap(role).assign(updateRoleDto);
    this.em.persistAndFlush(role);

    // 权限改变时，更新缓存
    if (updateRoleDto.access_menus) this.authSer.cacheUpdateRoleMenu(role.id);

    return role;
  }

  async remove(id: number) {
    const role = await this.roleRepo.findOne({ id: id });
    if (!role) throw new BadRequestException(`菜单${id}不存在`);
    this.em.removeAndFlush(role);
    this.authSer.cacheRemoveRoleMenu(id);
    return true;
  }
}
