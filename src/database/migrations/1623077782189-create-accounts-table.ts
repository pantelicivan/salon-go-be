import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

// Static
import {
  DATABASE_TABLE_NAMES,
  DATABASE_SCHEMA_NAMES,
} from '../../common/static/application.static';

export class createAccountsTable1623077782189 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: `${DATABASE_SCHEMA_NAMES.CORE}.${DATABASE_TABLE_NAMES.ACCOUNTS}`,
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid',
          },
          {
            name: 'email',
            type: 'varchar',
            isUnique: true,
          },
          {
            name: 'salt',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'password',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'role_id',
            type: 'uuid',
          },
          {
            name: 'email_verified_at',
            type: 'timestamp with time zone',
            isNullable: true,
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
          {
            name: 'deleted_at',
            type: 'timestamp with time zone',
            isNullable: true,
          },
        ],
      }),
      true,
      true,
    );

    await queryRunner.createForeignKey(
      `${DATABASE_SCHEMA_NAMES.CORE}.${DATABASE_TABLE_NAMES.ACCOUNTS}`,
      new TableForeignKey({
        name: 'FK_role',
        columnNames: ['role_id'],
        referencedColumnNames: ['id'],
        referencedTableName: `${DATABASE_SCHEMA_NAMES.CORE}.${DATABASE_TABLE_NAMES.ROLES}`,
        onDelete: 'RESTRICT',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable(
      `${DATABASE_SCHEMA_NAMES.CORE}.${DATABASE_TABLE_NAMES.ACCOUNTS}`,
      true,
      true,
      true,
    );
  }
}
