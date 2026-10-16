import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

// Entities
import { Account } from '.';

// Static
import {
  DATABASE_TABLE_NAMES,
  DATABASE_SCHEMA_NAMES,
} from '../../common/static/application.static';

@Entity(DATABASE_TABLE_NAMES.PASSWORD_RESETS, {
  schema: DATABASE_SCHEMA_NAMES.CORE,
})
export class PasswordReset extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'account_id' })
  accountId: string;

  @Column({
    name: 'expires_at',
    type: 'timestamp with time zone',
    default: "now() + interval '1 hour'",
  })
  expiresAt: Date;

  // timestamps
  @CreateDateColumn({
    type: 'timestamp with time zone',
    name: 'created_at',
    select: false,
  })
  createdAt?: Date;

  // relations
  @ManyToOne(() => Account, (account) => account.passwordResets, {
    onDelete: 'CASCADE',
  })
  @JoinColumn([{ name: 'account_id', referencedColumnName: 'id' }])
  account?: Account;
}
