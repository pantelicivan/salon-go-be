import { MigrationInterface, QueryRunner } from 'typeorm';

// Static
import {
  DATABASE_TABLE_NAMES,
  DATABASE_SCHEMA_NAMES,
} from '../../common/static/application.static';

export class triggerAfterDeleteOauthTokens1623763177000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE OR REPLACE FUNCTION delete_oauth_access_token() RETURNS trigger as $delete_oauth_access_token$
                BEGIN
                    delete from ${DATABASE_SCHEMA_NAMES.CORE}.${DATABASE_TABLE_NAMES.ACCESS_TOKENS}
                    where id = OLD.access_token_id;
                    return OLD;
                END;
            $delete_oauth_access_token$ LANGUAGE plpgsql;
        `);

    await queryRunner.query(`
            CREATE TRIGGER ad_oauth_tokens
                AFTER DELETE on ${DATABASE_SCHEMA_NAMES.CORE}.${DATABASE_TABLE_NAMES.REFRESH_TOKENS}
                FOR EACH ROW
                EXECUTE PROCEDURE delete_oauth_access_token();
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `drop trigger if exists ad_oauth_tokens on ${DATABASE_SCHEMA_NAMES.CORE}.${DATABASE_TABLE_NAMES.REFRESH_TOKENS};`,
    );
    await queryRunner.query(
      'drop function if exists delete_oauth_access_token;',
    );
  }
}
