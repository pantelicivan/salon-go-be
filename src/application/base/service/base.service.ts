import { EntityTarget } from 'typeorm';

// Repositories
import { BaseRepository } from '../../../database/repositories/base.repository';

// Contracts
import { DeepPartial, ObjectLiteral } from '../../../common/contracts';

export abstract class BaseService<T extends ObjectLiteral> {
  constructor(private readonly repo: BaseRepository<T>) {}

  /**
   * Finds entity by the given parameters with "AND" condition.
   * @param data - Partial entity object.
   * @returns Entity if found.
   */
  findOne(data: Partial<T> = {}): Promise<T | null> {
    return this.repo.findOne(data);
  }

  /**
   * Finds entities by the given parameters with "AND" condition.
   * @param data - Partial entity object.
   * @returns Entities.
   */
  find(data: Partial<T> = {}): Promise<T[]> {
    return this.repo.find(data);
  }

  /**
   * Creates an entity.
   * @param data - Entity creation data.
   * @throws - Can throw an exception for duplicate (origin, model_type, model_id).
   * @returns Created entity.
   */
  createEntity(data: DeepPartial<T>): Promise<T> {
    return this.repo.create(data);
  }

  /**
   * Return entity that matches passed data, or creates and returns new entity with passed data
   * @param data - Creation data.
   * @returns Entity.
   */
  findOrCreate(data: DeepPartial<T>): Promise<T> {
    return this.repo.findOrCreate(data);
  }

  /**
   * Deletes the given entity. (hard delete)
   * @param entity - Entity to delete
   */
  async deleteEntity(entity: T): Promise<void> {
    await this.repo.delete({ id: entity.id });
  }

  /**
   * Deletes the given entity. (soft delete)
   * @param entity - Entity to delete
   */
  async softDeleteEntity(entity: T): Promise<void> {
    await this.repo.softDelete({ id: entity.id });
  }

  /**
   * Updates the given Entity.
   * @param entity - Entity.
   * @param data - Data to update entity.
   */
  async updateEntity(entity: T, data: Partial<T>): Promise<void> {
    await this.repo.updateEntity(entity, data);
  }

  /**
   * Overrides relation data to the given entity.
   * @param entity - The existing entity.
   * @param relationData - Array of relation data.
   * @param relation - Relation.
   * @param entityType - Entity type(class name of the given entity)
   */
  async overrideRelationDataToEntity<T, R>(
    entity: T,
    relationData: R[],
    relation: string,
    entityType: EntityTarget<ObjectLiteral>,
  ): Promise<void> {
    const assignedRelationData = await this.repo.getAssignedRelationData<T>(
      entity,
      relation,
      entityType,
    );

    await this.repo.assignAndRemoveRelationData<T, R>(
      entity,
      relationData,
      assignedRelationData,
      relation,
      entityType,
    );
  }
}
