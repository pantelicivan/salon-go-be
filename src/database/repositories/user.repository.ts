import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

// Entities
import { User } from '../entities';

// Repositories
import { BaseRepository } from './base.repository';

// Static
import { CACHE_DURATIONS } from '../../infrastructure/cache/static/cache.static';

@Injectable()
export class UserRepository extends BaseRepository<User> {
  protected alias: string;

  constructor(@InjectRepository(User) protected repo: Repository<User>) {
    super(repo);
    this.alias = 'user';
  }
}
