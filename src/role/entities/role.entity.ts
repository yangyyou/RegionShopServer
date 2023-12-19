import { Collection, Entity, ManyToMany, Property } from '@mikro-orm/core';
import { BaseEntity } from '../../common/base.entity';
import { Menu } from 'src/menu/entities/menu.entity';

@Entity({ tableName: 'role_tab' })
export class Role extends BaseEntity {
  @Property({ unique: true })
  name!: string;

  @Property()
  remark?: string;

  @ManyToMany()
  access_menus = new Collection<Menu>(this);
}
