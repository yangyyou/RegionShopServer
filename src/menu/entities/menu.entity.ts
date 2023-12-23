import {
  Cascade,
  Collection,
  Entity,
  Enum,
  ManyToOne,
  OneToMany,
  Property,
  QueryOrder,
} from '@mikro-orm/core';
import { BaseEntity } from '../../common/base.entity';
import { MENU_TYPE } from '../menu.constant';

@Entity({ tableName: 'menu_tab' })
export class Menu extends BaseEntity {
  @Property({ unique: true })
  name!: string;

  @ManyToOne({ eager: true, hidden: true })
  parent?: Menu;

  @OneToMany(() => Menu, (menu) => menu.parent, {
    cascade: [Cascade.PERSIST],
    orphanRemoval: true,
    orderBy: { sort: QueryOrder.ASC },
    mappedBy: 'parent',
    eager: true,
  })
  children = new Collection<Menu>(this);

  @Property()
  router!: string;

  @Property({ default: 255 })
  sort: number;

  @Property()
  icon?: string;

  @Property()
  remark?: string;

  @Property({ persist: false })
  get router_path() {
    let router_list: string[] = [];
    let parent = this.parent;

    if (!this.parent) return '/' + this.router;

    while (parent) {
      router_list.push(parent.router);
      parent = parent.parent;
    }
    router_list = router_list.reverse();
    const path = router_list.join('/');
    return '/' + path + '/' + this.router;
  }

  @Enum(() => MENU_TYPE)
  type!: MENU_TYPE;

  @Property({ default: true })
  enable?: boolean;

  @Property({ default: false })
  hidden?: boolean;
}
