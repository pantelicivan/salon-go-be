import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

// Static
import {
  DATABASE_TABLE_NAMES,
  DATABASE_SCHEMA_NAMES,
} from '../../common/static/application.static';

export class createExternalIdsTable1623834096000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: `${DATABASE_SCHEMA_NAMES.CORE}.${DATABASE_TABLE_NAMES.EXTERNAL_IDS}`,
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid',
          },
          {
            name: 'model_type',
            type: 'varchar',
          },
          {
            name: 'model_id',
            type: 'uuid',
          },
          {
            name: 'origin',
            type: 'varchar',
          },
          {
            name: 'external_id',
            type: 'varchar',
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
      true,
    );

    await queryRunner.createIndex(
      `${DATABASE_SCHEMA_NAMES.CORE}.${DATABASE_TABLE_NAMES.EXTERNAL_IDS}`,
      new TableIndex({
        name: 'IDX_model_origin',
        columnNames: ['origin', 'model_type', 'model_id'],
        isUnique: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable(
      `${DATABASE_SCHEMA_NAMES.CORE}.${DATABASE_TABLE_NAMES.EXTERNAL_IDS}`,
      true,
      true,
      true,
    );
  }
}
