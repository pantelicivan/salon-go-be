import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToOne,
} from 'typeorm';

// Entities
import { Account, OAuthRefreshToken } from '.';

// Static
import {
  DATABASE_TABLE_NAMES,
  DATABASE_SCHEMA_NAMES,
} from '../../common/static/application.static';

@Entity(DATABASE_TABLE_NAMES.ACCESS_TOKENS, {
  schema: DATABASE_SCHEMA_NAMES.CORE,
})
export class OAuthAccessToken extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'account_id', select: false })
  accountId: string;

  @Column({ type: 'boolean', default: false })
  revoked: boolean;

  @Column({
    type: 'timestamp with time zone',
    name: 'expires_at',
  })
  expiresAt: Date;

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

  // Relations

  // One -> One
  @OneToOne(() => OAuthRefreshToken, (refreshToken) => refreshToken.accessToken)
  refreshToken?: OAuthRefreshToken;

  // Many -> one
  @ManyToOne(() => Account, (account) => account.accessTokens, {
    onDelete: 'CASCADE',
  })
  @JoinColumn([{ name: 'account_id', referencedColumnName: 'id' }])
  account?: Account;
}
