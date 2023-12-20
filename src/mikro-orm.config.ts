import { TsMorphMetadataProvider } from '@mikro-orm/reflection';
import { SqlHighlighter } from '@mikro-orm/sql-highlighter';
import { Logger } from '@nestjs/common';
import { TSMigrationGenerator } from '@mikro-orm/migrations';
import { defineConfig } from '@mikro-orm/core';
import { MySqlDriver } from '@mikro-orm/mysql';

const logger = new Logger('MikroOrm');
export const MikroOrmConfig = defineConfig({
  type: 'mysql',
  driver: MySqlDriver,
  host: 'localhost',
  port: 3306,
  dbName: 'region_shop',
  user: 'root',
  password: 'root',
  allowGlobalContext: true,
  metadataProvider: TsMorphMetadataProvider,

  entities: [__dirname + '/../dist/**/*.entity.js'],
  entitiesTs: [__dirname + '/../src/**/*.entity.ts'],
  baseDir: process.cwd(),

  debug: true,
  logger: logger.log.bind(logger),
  highlighter: new SqlHighlighter(),

  migrations: {
    tableName: 'mikro_orm_migrations',
    emit: 'ts',
    path: __dirname + '/../dist/migrations',
    pathTs: __dirname + '/../src/migrations',
    glob: '!(*.d).{js,ts}',
    generator: TSMigrationGenerator,
  },
});

export default MikroOrmConfig;
