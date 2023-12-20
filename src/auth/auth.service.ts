import { EntityManager, EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import {
  BadRequestException,
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RedisService } from 'src/shared/redis/redis.service';
import { User } from 'src/user/entities/user.entity';
import { encryptPassword } from './encryptPassword';
import { ConfigService } from '@nestjs/config';
import {
  REDIS_KEY_REFRESH_TOKEN,
  REDIS_KEY_ROLE_MENU,
  REDIS_KEY_USER_ROLE,
} from 'src/common/constant/common';
import { Role } from '../role/entities/role.entity';
import { CreateUserDto, LoginUserDto } from '../user/dto/user.dto';
import { Menu } from '../menu/entities/menu.entity';

@Injectable()
export class AuthService implements OnModuleInit, OnModuleDestroy {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: EntityRepository<User>,
    @InjectRepository(Role)
    private readonly roleRepo: EntityRepository<Role>,
    @InjectRepository(Menu)
    private readonly menuRepo: EntityRepository<Menu>,

    private readonly em: EntityManager,
    private readonly jwtSer: JwtService,
    private readonly redisSer: RedisService,
    private readonly configSer: ConfigService,
  ) {}

  // 用户注册
  async signup(createUserDto: CreateUserDto) {
    const { id: user_id, username } = await this.createUser(createUserDto);

    // 生成jwt token
    const tokens = await this.getTokens(user_id, username);
    console.log('生成token' + tokens.access_token);

    // refresh token 加载到redis
    this.cacheUpdateRefreshToken(user_id, tokens.refresh_token);
    this.cacheUpdateUserRole(user_id);

    return tokens;
  }

  // 用户登陆
  async login(loginDto: LoginUserDto) {
    // 查找用户
    const foundUser = await this.userRepo.findOne({
      username: loginDto.username,
    });
    if (!foundUser) throw new UnauthorizedException('用户不存在');

    // 密码核对
    const enPw = encryptPassword(loginDto.password);
    if (foundUser.password != enPw)
      throw new UnauthorizedException('密码不正确');

    // 生成token
    const tokens = await this.getTokens(foundUser.id, foundUser.username);

    // refresh token 记录在redis
    this.cacheUpdateRefreshToken(foundUser.id, tokens.refresh_token);
    this.cacheUpdateUserRole(foundUser.id);

    return tokens;
  }

  // 用户退出,删除redis token记录
  async logout(user_id: number) {
    this.cacheRemoveUserCache(user_id);
  }

  // 刷新refresh token
  async refreshToken(user_id: number, username: string, refresh_token: string) {
    const redisCli = this.redisSer.getRedisClient();
    // 查找redis记录refresh_token是否存在
    const reToken = await redisCli.get(REDIS_KEY_REFRESH_TOKEN + user_id);
    if (!reToken || reToken != refresh_token) {
      throw new UnauthorizedException('请重新登陆');
    }
    // 验证通过，生成新的ac，re tokens
    const tokens = await this.getTokens(user_id, username);
    this.cacheUpdateRefreshToken(user_id, tokens.refresh_token);
    this.cacheRemoveUserCache(user_id);
    return tokens;
  }

  async createUser(createUserDto: CreateUserDto) {
    const user = { id: 0, username: '' };
    // 检查用户名是否重复
    const exist = await this.userRepo.findOne({
      username: createUserDto.username,
    });
    if (exist) throw new BadRequestException('存在重复用户名');

    // 密码加密
    const pw = encryptPassword(createUserDto.password);

    // 写入数据库
    const newUser = this.userRepo.create({
      ...createUserDto,
      password: pw,
      roles: undefined,
    });

    // 如果有角色，添加角色
    if (createUserDto.roles) {
      for (let i = 0; i < createUserDto.roles.length; i++) {
        const role_id = createUserDto.roles[i];
        const role = await this.roleRepo.findOne({ id: role_id });
        if (!role)
          throw new BadRequestException(`注册用户添加的角色:${role_id}不存在`);
        newUser.roles.add(role);
      }
    }
    await this.em.persistAndFlush(newUser);
    user.id = newUser.id;
    user.username = newUser.username;
    return user;
  }

  private async getTokens(id: number, username: string) {
    const [access_token, refresh_token] = await Promise.all([
      this.jwtSer.signAsync(
        { sub: id, username },
        {
          secret: this.configSer.get<string>('auth.access_secret'),
          expiresIn: this.configSer.get<string>('auth.access_expire'),
        },
      ),
      this.jwtSer.signAsync(
        { sub: id, username },
        {
          secret: this.configSer.get<string>('auth.refresh_secret'),
          expiresIn: this.configSer.get<string>('auth.refresh_expire'),
        },
      ),
    ]);
    return { access_token, refresh_token };
  }

  // 更新refresh token记录到redis
  private async cacheUpdateRefreshToken(
    user_id: number,
    refresh_token: string,
  ) {
    const redisCli = this.redisSer.getRedisClient();
    const refreshToken_expire = this.configSer.get<string>(
      'auth.refresh_expire',
    );

    this.redisSer.set(
      redisCli,
      REDIS_KEY_REFRESH_TOKEN + user_id,
      refresh_token,
      refreshToken_expire,
    );
  }

  async cacheUpdateUserRole(user_id: number) {
    const redisCli = this.redisSer.getRedisClient();
    const roles: number[] = [];
    const user = await this.userRepo.findOne(
      { id: user_id },
      { fields: ['id', 'roles.id'] },
    );
    if (!user) return;

    const refreshToken_expire = this.configSer.get<string>(
      'auth.refresh_expire',
    );

    for (let i = 0; i < user.roles.length; i++) {
      const role = user.roles[i];
      roles.push(role.id);
    }
    this.redisSer.set(
      redisCli,
      REDIS_KEY_USER_ROLE + user.id,
      JSON.stringify(roles),
      refreshToken_expire,
    );
  }

  async cacheRemoveUserCache(user_id: number) {
    const redisCli = this.redisSer.getRedisClient();
    redisCli.del(REDIS_KEY_REFRESH_TOKEN + user_id);
    redisCli.del(REDIS_KEY_USER_ROLE + user_id);
  }

  async cacheRemoveRoleMenu(role_id = 0) {
    const redisCli = this.redisSer.getRedisClient();
    if (role_id) redisCli.hdel(REDIS_KEY_ROLE_MENU, role_id.toString());
    else redisCli.del(REDIS_KEY_ROLE_MENU);
  }

  // 更新role_menu缓存，默认0，表示更新所有
  async cacheUpdateRoleMenu(role_id = 0) {
    if (role_id) {
      const redisCli = this.redisSer.getRedisClient();
      redisCli.del([REDIS_KEY_ROLE_MENU + role_id]);
      const role = await this.roleRepo.findOne(
        { id: role_id },
        {
          populate: [
            'access_menus.id',
            'access_menus.enable',
            'access_menus.router_path',
          ],
        },
      );
      if (!role) return;
      const menus: string[] = [];
      for (let i = 0; i < role.access_menus.length; i++) {
        if (role.access_menus[i].enable) {
          menus.push(role.access_menus[i].router_path);
        }
      }
      redisCli.hset(REDIS_KEY_ROLE_MENU, role_id, JSON.stringify(menus));
    } else {
      const roles = await this.roleRepo.findAll({ fields: ['id'] });
      for (let i = 0; i < roles.length; i++) {
        this.cacheUpdateRoleMenu(roles[i].id);
      }
    }
  }

  // 当启动的时候加载权限相关缓存
  onModuleInit() {
    // 加载role,menu缓存
    this.cacheUpdateRoleMenu();
  }

  onModuleDestroy() {
    this.cacheRemoveRoleMenu();
  }
}
