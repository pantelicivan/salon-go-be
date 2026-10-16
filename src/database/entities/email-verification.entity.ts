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

@Entity(DATABASE_TABLE_NAMES.EMAIL_VERIFICATIONS, {
  schema: DATABASE_SCHEMA_NAMES.CORE,
})
export class EmailVerification extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'account_id' })
  accountId: string;

  @Column({
    name: 'expires_at',
    type: 'timestamp with time zone',
    default: "now() + interval '1 day'",
  })
  expiresAt: Date;

  // Timestamps
  @CreateDateColumn({
    type: 'timestamp with time zone',
    name: 'created_at',
    select: false,
  })
  createdAt?: Date;

  // Relations
  @ManyToOne(() => Account, (account) => account.emailVerifications, {
    onDelete: 'CASCADE',
  })
  @JoinColumn([{ name: 'account_id', referencedColumnName: 'id' }])
  account?: Account;
}
