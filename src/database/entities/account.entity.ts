import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
  OneToOne,
  DeleteDateColumn,
} from 'typeorm';
import * as bcrypt from 'bcrypt';

// Entities
import {
  OAuthAccessToken,
  PasswordReset,
  Role,
  User,
  EmailVerification,
} from '.';

// Contracts
import { PasswordHash } from '../../application/auth/contracts/auth.contracts';

// Static
import {
  DATABASE_TABLE_NAMES,
  DATABASE_SCHEMA_NAMES,
} from '../../common/static/application.static';

@Entity(DATABASE_TABLE_NAMES.ACCOUNTS, { schema: DATABASE_SCHEMA_NAMES.CORE })
export class Account extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'email', type: 'varchar', unique: true })
  email: string;

  @Column({ name: 'salt', type: 'varchar', nullable: true, select: false })
  salt?: string | null;

  @Column({ name: 'password', type: 'varchar', nullable: true, select: false })
  password?: string | null;

  @Column({ name: 'role_id', type: 'uuid' })
  roleId: string;

  @Column({
    name: 'email_verified_at',
    type: 'timestamp with time zone',
    nullable: true,
  })
  emailVerifiedAt: Date | null;

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

  @DeleteDateColumn({
    type: 'timestamp with time zone',
    name: 'deleted_at',
    nullable: true,
    select: false,
  })
  deletedAt?: Date | null;

  // Relations

  // One -> One
  @OneToOne(() => User, (user) => user.account)
  user?: User;

  /**
   * Sets user relation.
   * @param {User} user - User entity
   */
  setUser(user: User): void {
    this.user = user;
  }

  // One -> Many
  @ManyToOne(() => Role, (role) => role.accounts, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'role_id' })
  role?: Role;

  @OneToMany(
    () => EmailVerification,
    (emailVerification) => emailVerification.account,
  )
  emailVerifications?: EmailVerification[];

  @OneToMany(() => OAuthAccessToken, (accessToken) => accessToken.account)
  accessTokens?: OAuthAccessToken[];

  @OneToMany(() => PasswordReset, (passwordReset) => passwordReset.account)
  passwordResets?: PasswordReset[];

  // Current Auth Token
  private currentAuthToken?: OAuthAccessToken | null;

  setCurrentAuthToken(token: OAuthAccessToken): void {
    this.currentAuthToken = token;
  }

  getCurrentAuthToken(): OAuthAccessToken | null | undefined {
    return this.currentAuthToken;
  }

  // Polymorphic relations
  /**
   * @returns Model's type used to form polymorphic relations.
   */
  static getModelType(): string {
    return Account.name;
  }

  // Custom methods
  /**
   * Hashes password.
   * @param password - Password.
   * @returns
   */
  static async hashPassword(password: string): Promise<PasswordHash> {
    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);
    return {
      passwordHash,
      salt,
    };
  }
}
