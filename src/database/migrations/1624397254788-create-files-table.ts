import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

// Static
import {
  DATABASE_TABLE_NAMES,
  DATABASE_SCHEMA_NAMES,
} from '../../common/static/application.static';
import { FILE_TYPES } from '../../features/file-management/static';
import { PolymorphicContextEnum } from '../../common/static/polymorphic.static';

export class createFilesTable1624397254788 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: `${DATABASE_SCHEMA_NAMES.CORE}.${DATABASE_TABLE_NAMES.FILES}`,
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid',
          },
          {
            name: 'url',
            type: 'varchar',
            isUnique: true,
          },
          {
            name: 'key',
            type: 'varchar',
          },
          {
            name: 'type',
            type: 'enum',
            enum: FILE_TYPES,
          },
          {
            name: 'mime_type',
            type: 'varchar',
          },
          {
            name: 'model_type',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'model_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'context',
            type: 'varchar',
            default: `'${PolymorphicContextEnum.DEFAULT}'`,
          },
          {
            name: 'thumbnail_url',
            type: 'varchar',
            isUnique: true,
            isNullable: true,
          },
          {
            name: 'thumbnail_key',
            type: 'varchar',
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
        ],
      }),
      true,
      true,
      true,
    );

    await queryRunner.createIndex(
      `${DATABASE_SCHEMA_NAMES.CORE}.${DATABASE_TABLE_NAMES.FILES}`,
      new TableIndex({
        columnNames: ['url'],
      }),
    );

    await queryRunner.createIndex(
      `${DATABASE_SCHEMA_NAMES.CORE}.${DATABASE_TABLE_NAMES.FILES}`,
      new TableIndex({
        columnNames: ['model_type', 'model_id'],
      }),
    );

    await queryRunner.createIndex(
      `${DATABASE_SCHEMA_NAMES.CORE}.${DATABASE_TABLE_NAMES.FILES}`,
      new TableIndex({
        name: 'IDX_model_context',
        columnNames: ['model_type', 'model_id', 'context'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable(
      `${DATABASE_SCHEMA_NAMES.CORE}.${DATABASE_TABLE_NAMES.FILES}`,
      true,
      true,
      true,
    );
  }
}
