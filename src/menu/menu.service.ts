import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateMenuDto, UpdateMenuDto } from './menu.dto';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Menu } from './entities/menu.entity';
import { EntityManager, EntityRepository, wrap } from '@mikro-orm/core';
import { MENU_TYPE } from './menu.constant';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class MenuService {
  constructor(
    @InjectRepository(Menu)
    private readonly menuRepo: EntityRepository<Menu>,
    private readonly em: EntityManager,
    private readonly authSer: AuthService,
  ) {}

  async create(createMenuDto: CreateMenuDto) {
    let parent: Menu | null = null;
    // menu名称是否重复
    let exist = await this.menuRepo.count({ name: createMenuDto.name });
    if (exist) {
      throw new BadRequestException('存在重复的菜单名称');
    }

    // 如果是按键，必须指定父控件id
    if (createMenuDto.type == MENU_TYPE.BUTTON && !createMenuDto.parent_id) {
      throw new BadRequestException('按键必须指定父控件id');
    }

    // 鉴定输入父菜单是否存在
    if (createMenuDto.parent_id) {
      parent = await this.menuRepo.findOne({
        id: createMenuDto.parent_id,
      });
      if (!parent) {
        throw new BadRequestException('父菜单项不存在，请重新提交');
      }
    }

    // 检查路由是否重复
    exist = await this.menuRepo.count({
      router: createMenuDto.router,
      parent: createMenuDto.parent_id,
    });
    if (exist) {
      throw new BadRequestException('存在重复路由');
    }

    // 新菜单项写入数据库
    const newMenu = this.menuRepo.create({ ...createMenuDto, parent: parent });
    try {
      await this.em.persistAndFlush(newMenu);
    } catch (error) {
      throw new BadRequestException(error);
    }

    return newMenu;
  }

  findAll() {
    const menus = this.menuRepo.find({ parent: null });
    return menus;
  }

  async findOne(id: number) {
    const menu = await this.menuRepo.findOne({ id: id });
    if (!menu) throw new NotFoundException('没有找到菜单');
    return menu;
  }

  async update(id: number, updateMenuDto: UpdateMenuDto) {
    // 查找菜单是否存在
    const menu = await this.menuRepo.findOne(
      { id: id },
      { populate: ['parent.type'] },
    );
    if (!menu) {
      throw new BadRequestException('菜单项不存在');
    }
    // 类型变更成button，检查parent是否是menu
    if (
      updateMenuDto.type == MENU_TYPE.BUTTON &&
      menu.parent.type == MENU_TYPE.BUTTON
    ) {
      throw new BadRequestException('button项父菜单应为menu');
    }

    // 如果名称变更，检查是否有重复
    if (updateMenuDto.name) {
      const exist = await this.menuRepo.count({ name: updateMenuDto.name });
      if (exist) throw new BadRequestException('存在重复菜单名称');
    }

    // 如果路由变更，检查是否有重复
    if (updateMenuDto.router) {
      const exist = await this.menuRepo.count({
        router: updateMenuDto.router,
        parent: menu.parent,
      });
      if (exist) throw new BadRequestException('存在重复路由');
    }

    try {
      await wrap(menu).assign(updateMenuDto);
      this.em.persistAndFlush(menu);
    } catch (error) {
      throw new BadRequestException(error);
    }

    // 当enable、router改变时，更新缓存
    if (updateMenuDto.enable != undefined || updateMenuDto.router) {
      this.authSer.cacheUpdateRoleMenu();
    }

    return menu;
  }

  async remove(id: number) {
    const delMenu = await this.menuRepo.findOne({ id: id });
    if (!delMenu) {
      throw new NotFoundException('没有找到要删除的菜单');
    }
    try {
      await this.em.removeAndFlush(delMenu);
    } catch (error) {
      throw new BadRequestException(error);
    }
    console.log(`delete menu ${id}`);
    // 当menu删除时，更新role menu 缓存
    this.authSer.cacheUpdateRoleMenu();
    return true;
  }
}
