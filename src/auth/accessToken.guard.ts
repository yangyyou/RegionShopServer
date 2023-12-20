import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import {
  IS_PUBLIC_KEY,
  REDIS_KEY_ROLE_MENU,
  REDIS_KEY_USER_ROLE,
} from '../common/constant/common';
import { Request } from 'express';
import { RedisService } from '../shared/redis/redis.service';

@Injectable()
export class AccessTokenGuard extends AuthGuard('jwt') {
  constructor(
    private readonly reflector: Reflector,
    private readonly redisSer: RedisService,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 1 判断是否跳过校验
    const isPublic = this.reflector.get<boolean>(
      IS_PUBLIC_KEY,
      context.getHandler(),
    );
    if (isPublic) return true;

    // 2 jwt鉴权
    const bAccessToken = await super.canActivate(context);
    if (!bAccessToken) return false;

    // TODO: 3 RBAC权限检查
    let IsMatch = false;
    const redisCli = this.redisSer.getRedisClient();
    const req = context.switchToHttp().getRequest<Request>();
    const url = req.url;

    // 获取缓存用户 角色列表
    const roles: number[] = JSON.parse(
      await redisCli.get(REDIS_KEY_USER_ROLE + req.user['sub']),
    );
    // 获取用户 menu列表
    let menus_router: string[] = [];
    for (let i = 0; i < roles.length; i++) {
      const role = roles[i];
      const menu: string[] = JSON.parse(
        await redisCli.hget(REDIS_KEY_ROLE_MENU, role.toString()),
      );
      menus_router = [...menus_router, ...menu];
    }

    // 匹配路径是否有权限
    for (let i = 0; i < menus_router.length; i++) {
      const router = menus_router[i];
      // 正则表达式匹配到完整路由或者/后接其他路径
      const router_patter = new RegExp('^' + router + '(/.*|$)');
      if (url.match(router_patter)) {
        console.log('匹配到路由:' + router);
        IsMatch = true;
        break;
      }
    }

    console.log('url:' + url + ',权限校验结果' + IsMatch);

    return IsMatch;
  }
}
