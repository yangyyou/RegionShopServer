import { Collection, Entity, ManyToMany, Property } from '@mikro-orm/core';
import { BaseEntity } from '../../common/base.entity';
import { Role } from '../../role/entities/role.entity';

@Entity({ tableName: 'user_tab' })
export class User extends BaseEntity {
  @Property({ unique: true })
  username!: string;

  @Property()
  password!: string;

  @ManyToMany()
  roles = new Collection<Role>(this);

  @Property()
  email?: string;

  @Property()
  phone?: string;

  @Property()
  born?: Date;

  constructor() {
    super();
  }
}
