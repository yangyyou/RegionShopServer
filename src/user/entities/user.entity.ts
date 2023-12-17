import { Entity, Property } from '@mikro-orm/core';
import { BaseEntity } from '../../common/base.entity';

@Entity({ tableName: 'user_tab' })
export class User extends BaseEntity {
  @Property({ unique: true })
  username!: string;

  @Property()
  password!: string;

  @Property()
  email?: string;

  @Property()
  phone?: string;

  @Property()
  age?: number;

  @Property()
  born?: Date;

  constructor() {
    super();
  }
}
