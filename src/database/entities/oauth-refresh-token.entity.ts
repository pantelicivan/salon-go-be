import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  OneToOne,
} from 'typeorm';

// Entities
import { OAuthAccessToken } from '.';

// Static
import {
  DATABASE_TABLE_NAMES,
  DATABASE_SCHEMA_NAMES,
} from '../../common/static/application.static';

@Entity(DATABASE_TABLE_NAMES.REFRESH_TOKENS, {
  schema: DATABASE_SCHEMA_NAMES.CORE,
})
export class OAuthRefreshToken extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'access_token_id' })
  accessTokenId: string;

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

  // One -> one
  @OneToOne(() => OAuthAccessToken, (accessToken) => accessToken.refreshToken, {
    onDelete: 'CASCADE',
  })
  @JoinColumn([{ name: 'access_token_id', referencedColumnName: 'id' }])
  accessToken?: OAuthAccessToken;
}
