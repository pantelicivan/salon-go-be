import {
  EntityTarget,
  FindOptionsWhere,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { FindOptionsRelations } from 'typeorm/find-options/FindOptionsRelations';

// Contracts
import {
  DeepPartial,
  EntityAndCount,
  ObjectLiteral,
} from '../../common/contracts';

// Static
import { DATABASE_SCHEMA_NAMES } from '../../common/static/application.static';

// Utils
import {
  calculateOffset,
  filterUndefinedKeys,
  isEmpty,
} from '../../common/utils';

export abstract class BaseRepository<T extends ObjectLiteral> {
  /**
   * Set the table alias for the query builder.
   */
  protected abstract alias: string;

  constructor(protected readonly repo: Repository<T>) {}

  /**
   * Finds an entity by the given ID.
   * @param id - Entity's id.
   * @returns Entity or undefined.
   */
  findById(id: number | string): Promise<T | null> {
    return this.repo.findOneBy({ id } as any);
  }

  /**
   * Finds an entity by the given conditions.
   * @param criteria - Entity's find criteria.
   * @returns Entity or undefined.
   */
  findOne(criteria: FindOptionsWhere<T> = {}): Promise<T | null> {
    return this.repo.findOneBy(criteria);
  }

  /**
   * Finds an entity with past relations by the given conditions.
   * @param criteria - Entity's find criteria.
   * @param relations - Entity's find criteria.
   * @returns Entity or undefined.
   */
  findOneWithRelations(
    criteria: FindOptionsWhere<T> = {},
    relations: FindOptionsRelations<T>,
  ): Promise<T | null> {
    return this.repo.findOne({ where: criteria, relations });
  }

  /**
   * Finds entities by the given conditions.
   * @param criteria - Entity's find criteria.
   * @returns Entities.
   */
  find(criteria: FindOptionsWhere<T> = {}): Promise<T[]> {
    return this.repo.findBy(criteria);
  }

  /**
   * Creates a new entity.
   * @param data - Creation data.
   * @returns Created entity.
   */
  create<D extends DeepPartial<T>>(data: D): Promise<T> {
    return this.repo.save(this.repo.create(data));
  }

  /**
   * Return entity that matches passed data, or creates and returns new entity with passed data
   * @param data - Creation data.
   * @returns Entity.
   */
  async findOrCreate<D extends DeepPartial<T>>(data: D): Promise<T> {
    const entity = await this.repo.findOne({
      where: data as unknown as FindOptionsWhere<T>,
    });

    if (entity) {
      return entity;
    }
    return this.repo.save(this.repo.create(data));
  }

  /**
   * Updates entities by the given criteria.
   * @param criteria - Entity's find criteria.
   * @param data - Update data.
   * @returns A boolean indicating if any record has been affected.
   */
  async update(
    criteria: FindOptionsWhere<T>,
    data: QueryDeepPartialEntity<T>,
  ): Promise<boolean> {
    const result = await this.repo.update(criteria, data);
    return !!result.affected && result.affected > 0;
  }

  /**
   * Updates the given entity.
   * @param entity - Entity to update.
   * @param data - Update data.
   */
  async updateEntity<D extends Record<string, any>>(
    entity: T,
    data: D,
  ): Promise<void> {
    const filtered = filterUndefinedKeys(data);
    if (isEmpty(filtered)) return;
    Object.assign(entity, filtered);
    await this.repo.save(entity);
  }

  /**
   * Deletes entities by the given criteria.
   * @param criteria - Entity's find criteria.
   * @returns A boolean indicating if any record has been affected.
   */
  async delete(criteria: FindOptionsWhere<T>): Promise<boolean> {
    const result = await this.repo.delete(criteria);
    return !!result.affected && result.affected > 0;
  }

  /**
   * Soft deletes entities by the given criteria.
   * @param criteria - Entity's find criteria.
   * @returns A boolean indicating if any record has been affected.
   */
  async softDelete(criteria: FindOptionsWhere<T>): Promise<boolean> {
    const result = await this.repo.softDelete(criteria);
    return !!result.affected && result.affected > 0;
  }

  /**
   * Run SELECT EXISTS query with the given conditions.
   * @param whereString - String that goes in WHERE ${whereString}
   * @param bindings - Bindings for the whereString
   * @returns Boolean indicating if any entities exist.
   */
  async exists(
    whereString: string,
    bindings: Array<string | number>,
  ): Promise<boolean> {
    const table = this.repo.metadata.tableName;
    const result = await this.repo.query(
      `SELECT EXISTS (SELECT 1 from ${DATABASE_SCHEMA_NAMES.CORE}.${table} WHERE ${whereString})`,
      bindings,
    );
    return result[0].exists;
  }

  /**
   * Determines if the entity exists by the given id.
   * @param id - Entity's id.
   * @returns Boolean indicating if an entity exists.
   */
  existsById(id: string): Promise<boolean> {
    return this.exists('id = $1', [id]);
  }

  /**
   * Determines if the entity by the given id is not deleted.
   * @param id - Entity's id.
   * @returns Boolean indicating if an entity exists and is not deleted.
   */
  notSoftDeletedById(id: number): Promise<boolean> {
    // TypeORM will not add deleted_at IS NULL in raw queries
    return this.exists('id = $1 AND deleted_at IS NULL', [id]);
  }

  /**
   * Updates entity with passed unique condition and data or
   * creates new entity for passed condition and data
   * @param condition - condition to find entity
   * @param data - update or addition create data
   */
  async updateOrCreate<D extends DeepPartial<T>>(
    condition: D,
    data: D,
  ): Promise<T> {
    const entity = await this.findOrNew(condition);
    Object.assign(entity, filterUndefinedKeys(data));
    return this.repo.save(entity);
  }

  /**
   * Return entity that matches passed data, or creates and returns new entity with passed data
   *  - This doesn't persist data to database
   * @param data - Creation data.
   * @returns Entity.
   */
  protected async findOrNew<D extends DeepPartial<T>>(data: D): Promise<T> {
    const entity = await this.repo.findOne({
      where: data as unknown as FindOptionsWhere<T>,
    });
    if (entity) {
      return entity;
    }
    return this.repo.create(data);
  }
  /**
   * A query builder to be used in the child repositories.
   * @returns Select query builder instance.
   */
  protected qb(): SelectQueryBuilder<T> {
    return this.repo.createQueryBuilder(this.alias);
  }

  /**
   * Finds the given page of entities.
   * This function uses take and skip and should be used when retrieving entities with additional relations.
   * @param qb - Select query builder with relations.
   * @param limit - Entities count per page.
   * @param  page - Page number.
   * @returns Array with two elements:
   *  1. list of entities
   *  2. count of all entities.
   */
  protected pagingWithSkip(
    qb: SelectQueryBuilder<T>,
    limit: number,
    page: number,
  ): Promise<EntityAndCount<T>> {
    return qb.take(limit).skip(calculateOffset(limit, page)).getManyAndCount();
  }

  /**
   * Finds the given page of entities.
   * This class uses limit and offset and should be used when retrieving entities without additional relations.
   * @param qb - Select query builder.
   * @param limit - Entities count per page.
   * @param  page - Page number.
   * @returns Array with two elements:
   *  1. list of entities
   *  2. count of all entities.
   */
  protected pagingWithOffset(
    qb: SelectQueryBuilder<T>,
    limit: number,
    page: number,
  ): Promise<EntityAndCount<T>> {
    return qb
      .limit(limit)
      .offset(calculateOffset(limit, page))
      .getManyAndCount();
  }

  /**
   * Returns entity's assigned relation data.
   * @param entity - Entity for which we get relation.
   * @param relation - Relation.
   * @param entityType - Entity type(class name of the given entity)
   * @returns Assigned relation data.
   */
  async getAssignedRelationData<T>(
    entity: T,
    relation: string,
    entityType: EntityTarget<ObjectLiteral>,
  ): Promise<T[]> {
    return this.repo
      .createQueryBuilder()
      .relation(entityType, relation)
      .of(entity)
      .loadMany();
  }

  /**
   * Assigns the new relation to the given entity.
   * Removes the given relation that are already assigned.
   * @param entity - Entity to which we assign relation.
   * @param relationData - New relation data to be assigned.
   * @param assignedRelationData - Assigned relation data to be removed.
   * @param relation - Relation.
   * @param entityType - Entity type(class name of the given entity)
   */
  async assignAndRemoveRelationData<T, R>(
    entity: T,
    relationData: R[] | undefined,
    assignedRelationData: T[],
    relation: string,
    entityType: EntityTarget<ObjectLiteral>,
  ): Promise<void> {
    const query = this.repo
      .createQueryBuilder()
      .relation(entityType, relation)
      .of(entity);

    if (!relationData || relationData.length === 0) {
      return query.remove(assignedRelationData);
    }

    return query.addAndRemove(relationData, assignedRelationData);
  }
}
