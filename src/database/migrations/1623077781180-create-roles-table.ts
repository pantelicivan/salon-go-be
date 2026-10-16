import { MigrationInterface, QueryRunner, Table } from 'typeorm';

// Static
import {
  DATABASE_TABLE_NAMES,
  DATABASE_SCHEMA_NAMES,
} from '../../common/static/application.static';
import { RoleKeyEnum } from '../../application/auth/static/auth.static';

export class createRolesTable1623077781180 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    return queryRunner.createTable(
      new Table({
        name: `${DATABASE_SCHEMA_NAMES.CORE}.${DATABASE_TABLE_NAMES.ROLES}`,
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid',
          },
          {
            name: 'name',
            type: 'varchar',
            isUnique: true,
          },
          {
            name: 'key',
            type: 'enum',
            enum: Object.values(RoleKeyEnum),
            isUnique: true,
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
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    return queryRunner.dropTable(
      `${DATABASE_SCHEMA_NAMES.CORE}.${DATABASE_TABLE_NAMES.ROLES}`,
    );
  }
}
