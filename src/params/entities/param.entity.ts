import { Entity, Property } from '@mikro-orm/core';
import { BaseEntity } from '../../common/base.entity';

@Entity({ tableName: 'params_tab' })
export class Param extends BaseEntity {
  @Property({ type: 'varchar', length: 50, unique: true })
  key!: string;

  @Property({ type: 'varchar' })
  value?: string;

  @Property()
  remark?: string;
}
