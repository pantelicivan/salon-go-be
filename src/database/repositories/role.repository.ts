import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

// Entities
import { Role } from '../entities';

// Repositories
import { BaseRepository } from './base.repository';

// Static
import { CACHE_DURATIONS } from '../../infrastructure/cache/static/cache.static';
import { RoleKeyEnum } from '../../application/auth/static/auth.static';

@Injectable()
export class RoleRepository extends BaseRepository<Role> {
  protected alias: string;

  constructor(@InjectRepository(Role) protected repo: Repository<Role>) {
    super(repo);
    this.alias = 'role';
  }

  /**
   * Find a role by the given key.
   * @param key - Role key enum.
   * @returns Role if found.
   */
  findByKey(key: RoleKeyEnum): Promise<Role | null> {
    return this.qb()
      .cache(CACHE_DURATIONS.PERMANENT)
      .where('key = :key', { key })
      .getOne();
  }
}
