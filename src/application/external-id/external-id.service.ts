import { Injectable } from '@nestjs/common';

// Services
import { BaseService } from '../base/service/base.service';

// Entities
import { ExternalId } from '../../database/entities';

// Repositories
import { ExternalIdRepository } from '../../database/repositories';

@Injectable()
export class ExternalIDService extends BaseService<ExternalId> {
  constructor(private externalIdRepository: ExternalIdRepository) {
    super(externalIdRepository);
  }
}
