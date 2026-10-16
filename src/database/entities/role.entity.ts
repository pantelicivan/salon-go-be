import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

// Entities
import { Account } from '.';

// Static
import {
  DATABASE_TABLE_NAMES,
  DATABASE_SCHEMA_NAMES,
} from '../../common/static/application.static';
import { RoleKeyEnum } from '../../application/auth/static/auth.static';

@Entity(DATABASE_TABLE_NAMES.ROLES, { schema: DATABASE_SCHEMA_NAMES.CORE })
export class Role extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'name', type: 'varchar', unique: true })
  name: string;

  @Column({ name: 'key', type: 'enum', enum: RoleKeyEnum, unique: true })
  key: RoleKeyEnum;

  @CreateDateColumn({
    type: 'timestamp with time zone',
    name: 'created_at',
    select: false,
  })
  createdAt?: Date;

  @UpdateDateColumn({
    type: 'timestamp with time zone',
    name: 'updated_at',
    select: false,
  })
  updatedAt?: Date;

  // Relations

  // One -> Many
  @OneToMany(() => Account, (account) => account.role)
  accounts?: Account[];
}
