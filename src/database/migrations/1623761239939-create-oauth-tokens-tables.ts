import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableUnique,
} from 'typeorm';

// Static
import {
  DATABASE_TABLE_NAMES,
  DATABASE_SCHEMA_NAMES,
} from '../../common/static/application.static';

export class createOauthTokensTables1623761239939
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: `${DATABASE_SCHEMA_NAMES.CORE}.${DATABASE_TABLE_NAMES.ACCESS_TOKENS}`,
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid',
          },
          {
            name: 'revoked',
            type: 'boolean',
            default: false,
          },
          {
            name: 'account_id',
            type: 'uuid',
          },
          {
            name: 'expires_at',
            type: 'timestamp with time zone',
          },
          {
            name: 'created_at',
            type: 'timestamp with time zone',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp with time zone',
            default: 'now()',
          },
        ],
      }),
      true,
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: `${DATABASE_SCHEMA_NAMES.CORE}.${DATABASE_TABLE_NAMES.REFRESH_TOKENS}`,
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid',
          },
          {
            name: 'revoked',
            type: 'boolean',
            default: false,
          },
          {
            name: 'access_token_id',
            type: 'uuid',
          },
          {
            name: 'expires_at',
            type: 'timestamp with time zone',
          },
          {
            name: 'created_at',
            type: 'timestamp with time zone',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp with time zone',
            default: 'now()',
          },
        ],
      }),
      true,
      true,
    );

    await queryRunner.createForeignKey(
      `${DATABASE_SCHEMA_NAMES.CORE}.${DATABASE_TABLE_NAMES.ACCESS_TOKENS}`,
      new TableForeignKey({
        name: 'FK_account',
        columnNames: ['account_id'],
        referencedColumnNames: ['id'],
        referencedTableName: `${DATABASE_SCHEMA_NAMES.CORE}.${DATABASE_TABLE_NAMES.ACCOUNTS}`,
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      `${DATABASE_SCHEMA_NAMES.CORE}.${DATABASE_TABLE_NAMES.REFRESH_TOKENS}`,
      new TableForeignKey({
        name: 'FK_access_token',
        columnNames: ['access_token_id'],
        referencedColumnNames: ['id'],
        referencedTableName: `${DATABASE_SCHEMA_NAMES.CORE}.${DATABASE_TABLE_NAMES.ACCESS_TOKENS}`,
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createUniqueConstraint(
      `${DATABASE_SCHEMA_NAMES.CORE}.${DATABASE_TABLE_NAMES.REFRESH_TOKENS}`,
      new TableUnique({
        name: 'UQ_access_token',
        columnNames: ['access_token_id'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable(
      `${DATABASE_SCHEMA_NAMES.CORE}.${DATABASE_TABLE_NAMES.ACCESS_TOKENS}`,
      true,
      true,
      true,
    );
    await queryRunner.dropTable(
      `${DATABASE_SCHEMA_NAMES.CORE}.${DATABASE_TABLE_NAMES.REFRESH_TOKENS}`,
      true,
      true,
      true,
    );
  }
}
