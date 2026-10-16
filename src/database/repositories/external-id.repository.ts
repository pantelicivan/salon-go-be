import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

// Entities
import { ExternalId } from '../entities';

// Repositories
import { BaseRepository } from './base.repository';

@Injectable()
export class ExternalIdRepository extends BaseRepository<ExternalId> {
  protected alias: string;

  constructor(
    @InjectRepository(ExternalId) protected repo: Repository<ExternalId>,
  ) {
    super(repo);
    this.alias = 'externalId';
  }

  /**
   * Finds external id by origin for the given model type.
   * @param data - External id's origin, value and model's type.
   * @returns External id if found.
   */
  findByOrigin(
    data: Pick<ExternalId, 'externalId' | 'origin' | 'modelType'>,
  ): Promise<ExternalId | null> {
    return this.findOne({
      modelType: data.modelType ?? undefined,
      origin: data.origin,
      externalId: data.externalId,
    });
  }

  /**
   * Finds external ids by origin for the given model type.
   * @param data - External id's origin, model's type and external ids.
   * @returns External ids
   */
  findManyByOrigin({
    origin,
    modelType,
    externalIds,
  }: Pick<ExternalId, 'origin' | 'modelType'> & {
    externalIds: string[];
  }): Promise<ExternalId[]> {
    return this.qb()
      .where(`${this.alias}.origin = :origin`, { origin })
      .andWhere(`${this.alias}.modelType = :modelType`, { modelType })
      .andWhere(`${this.alias}.externalId IN (:...externalIds)`, {
        externalIds,
      })
      .getMany();
  }
}
