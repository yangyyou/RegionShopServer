import { ModuleMetadata } from '@nestjs/common';
import {
  Cluster,
  ClusterNode,
  ClusterOptions,
  Redis,
  RedisOptions,
} from 'ioredis';

export interface RedisModuleOptions extends RedisOptions {
  // 定义redis链接名称，默认default
  name?: string;

  // 支持url
  url?: string;

  // 支持cluster模式
  cluster: boolean;

  // cluster node
  node?: ClusterNode[];

  // cluster option
  clusterOpt: ClusterOptions;
}

export interface RedisModuleAsyncOptions
  extends Pick<ModuleMetadata, 'imports' | 'providers'> {
  inject: any[];
  useFactory?: (
    ...args: any[]
  ) =>
    | RedisModuleOptions
    | RedisModuleOptions[]
    | Promise<RedisModuleOptions>
    | Promise<RedisModuleOptions[]>;
}

export type RedisClients = Map<string, Redis | Cluster>;
