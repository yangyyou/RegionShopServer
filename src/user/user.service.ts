import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { User } from './entities/user.entity';
import { EntityManager, EntityRepository, wrap } from '@mikro-orm/core';
import { Role } from '../role/entities/role.entity';
import { AuthService } from '../auth/auth.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: EntityRepository<User>,
    @InjectRepository(Role)
    private readonly roleRepo: EntityRepository<Role>,
    private readonly em: EntityManager,
    private readonly authSer: AuthService,
  ) {}

  // 管理员创建用户
  create(createUserDto: CreateUserDto) {
    return this.authSer.createUser(createUserDto);
  }

  // 获取所有用户
  findAll() {
    const users = this.userRepo.findAll({ populate: ['roles.id'] });
    return users;
  }

  // 获取单个用户
  async findOne(id: number) {
    const user = await this.userRepo.findOne(
      { id: id },
      { populate: ['roles.id', 'roles.name'] },
    );
    if (!user) throw new BadRequestException(`用户${id}不存在`);

    return user;
  }

  async update(updateUserDto: UpdateUserDto) {
    const user = await this.userRepo.findOne(
      { id: updateUserDto.id },
      { populate: ['roles.id'] },
    );
    if (!user)
      throw new BadRequestException(`user ${updateUserDto.id} no exist.`);

    // 若更改roles 检查role是否存在
    if (updateUserDto.roles) {
      user.roles.removeAll();
      for (let i = 0; i < updateUserDto.roles.length; i++) {
        const role_id = updateUserDto.roles[i];
        const role = await this.roleRepo.findOne({ id: role_id });
        if (!role) throw new BadRequestException(`role ${role_id} no exist.`);
        user.roles.add(role);
      }
    }
    for (const key in updateUserDto) {
      if (key != 'id' && key != 'roles') user[key] = updateUserDto[key];
    }
    this.em.persistAndFlush(user);
    // 如果role更新则更新缓存
    if (updateUserDto.roles) this.authSer.cacheUpdateUserRole(updateUserDto.id);
    return user;
  }

  async remove(id: number) {
    // 查找是否存在
    const user = await this.userRepo.findOne({ id: id });
    if (!user) throw new BadRequestException(`user ${id} no exist.`);
    this.em.removeAndFlush(user);
    this.authSer.cacheRemoveUserCache(id);
    return true;
  }
}
