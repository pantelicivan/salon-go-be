import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';

// Entities
import { Account } from '.';

// Static
import {
  DATABASE_TABLE_NAMES,
  DATABASE_SCHEMA_NAMES,
} from '../../common/static/application.static';

@Entity(DATABASE_TABLE_NAMES.USERS, { schema: DATABASE_SCHEMA_NAMES.CORE })
export class User extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'account_id', type: 'uuid', unique: true })
  accountId: string;

  @Column({ name: 'email', type: 'varchar', unique: true })
  email: string;

  @Column({ name: 'first_name', type: 'varchar', nullable: true })
  firstName: string | null;

  @Column({ name: 'last_name', type: 'varchar', nullable: true })
  lastName: string | null;

  // Timestamps
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

  @Column({
    type: 'timestamp with time zone',
    name: 'deleted_at',
    nullable: true,
    select: false,
  })
  deletedAt?: Date | null;

  // Relations

  // One -> One
  @OneToOne(() => Account, (account) => account.user, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'account_id',
  })
  account?: Account;

  /**
   * @returns Model's type used to form polymorphic relations.
   */
  static getModelType(): string {
    return User.name;
  }
}
