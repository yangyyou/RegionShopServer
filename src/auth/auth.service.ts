import { EntityManager, EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RedisService } from 'src/shared/redis/redis.service';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { User } from 'src/user/entities/user.entity';
import { encryptPassword } from './encryptPassword';
import { ConfigService } from '@nestjs/config';
import { LoginUserDto } from 'src/user/dto/login_user.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: EntityRepository<User>,
    private readonly em: EntityManager,
    private readonly jwtSer: JwtService,
    private readonly redisSer: RedisService,
    private readonly configSer: ConfigService,
  ) {}

  async signup(createUserDto: CreateUserDto) {
    // 检查用户名是否重复
    const exist = await this.userRepo.findOne({
      username: createUserDto.username,
    });
    if (exist) throw new BadRequestException('存在重复用户名');

    // 密码加密
    const pw = encryptPassword(createUserDto.password);
    console.log('密码加密:' + pw);

    // 写入数据库
    const newUser = this.userRepo.create({ ...createUserDto, password: pw });
    console.log(newUser);

    // 生成jwt token
    const tokens = await this.getTokens(newUser.id, newUser.username);
    console.log('生成token' + tokens.access_token);

    // refresh token 加载到redis
    this.updateRefreshToken(newUser.id, tokens.refresh_token);

    await this.em.persistAndFlush(newUser);

    return tokens;
  }

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
    this.updateRefreshToken(foundUser.id, tokens.refresh_token);

    return tokens;
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
  private async updateRefreshToken(user_id: number, refresh_token: string) {
    const redisCli = this.redisSer.getRedisClient();
    const refreshToken_expire = this.configSer.get<string>(
      'auth.refresh_expire',
    );

    // TODO：设置token超时时间
    this.redisSer.set(
      redisCli,
      'user:refresh_token:' + user_id,
      refresh_token,
      refreshToken_expire,
    );
  }

  // 刷新refresh token
  async refreshToken(user_id: number, username: string, refresh_token: string) {
    const redisCli = this.redisSer.getRedisClient();
    // 查找redis记录refresh_token是否存在
    const reToken = await redisCli.get('user:refresh_token:' + user_id);
    if (!reToken || reToken != refresh_token) {
      throw new UnauthorizedException('请重新登陆');
    }
    // 验证通过，生成新的ac，re tokens
    const tokens = await this.getTokens(user_id, username);
    this.updateRefreshToken(user_id, tokens.refresh_token);
    return tokens;
  }
}
