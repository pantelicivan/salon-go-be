import { MigrationInterface, QueryRunner } from 'typeorm';

// Entities
import { Account } from '../entities';

// Static
import {
  DATABASE_TABLE_NAMES,
  DATABASE_SCHEMA_NAMES,
} from '../../common/static/application.static';

export class triggerAfterDeleteAccount1623842273000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE OR REPLACE FUNCTION delete_external_ids_for_accounts() RETURNS trigger as $delete_external_ids_for_accounts$
                BEGIN
                    delete from ${DATABASE_SCHEMA_NAMES.CORE}.${
      DATABASE_TABLE_NAMES.EXTERNAL_IDS
    }
                    where model_id = OLD.id
                    and model_type = '${Account.getModelType()}';
                    return OLD;
                END;
            $delete_external_ids_for_accounts$ LANGUAGE plpgsql;
        `);

    await queryRunner.query(`
            CREATE TRIGGER ad_accounts
                AFTER DELETE on ${DATABASE_SCHEMA_NAMES.CORE}.${DATABASE_TABLE_NAMES.ACCOUNTS}
                FOR EACH ROW
                EXECUTE PROCEDURE delete_external_ids_for_accounts();
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `drop trigger if exists ad_accounts on ${DATABASE_SCHEMA_NAMES.CORE}.${DATABASE_TABLE_NAMES.ACCOUNTS};`,
    );
    await queryRunner.query(
      'drop function if exists delete_external_ids_for_accounts;',
    );
  }
}
