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

export class createPasswordResetsTable1624460919000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: `${DATABASE_SCHEMA_NAMES.CORE}.${DATABASE_TABLE_NAMES.PASSWORD_RESETS}`,
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid',
          },
          {
            name: 'account_id',
            type: 'uuid',
          },
          {
            name: 'expires_at',
            type: 'timestamp with time zone',
            default: "now() + interval '1 hour'",
          },
          {
            name: 'created_at',
            type: 'timestamp with time zone',
            default: 'now()',
          },
        ],
      }),
      true,
      true,
      true,
    );

    await queryRunner.createForeignKey(
      `${DATABASE_SCHEMA_NAMES.CORE}.${DATABASE_TABLE_NAMES.PASSWORD_RESETS}`,
      new TableForeignKey({
        columnNames: ['account_id'],
        referencedColumnNames: ['id'],
        referencedTableName: `${DATABASE_SCHEMA_NAMES.CORE}.${DATABASE_TABLE_NAMES.ACCOUNTS}`,
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable(
      `${DATABASE_SCHEMA_NAMES.CORE}.${DATABASE_TABLE_NAMES.PASSWORD_RESETS}`,
      true,
      true,
      true,
    );
  }
}
