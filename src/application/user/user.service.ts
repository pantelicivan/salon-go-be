import { Injectable } from '@nestjs/common';

// Services
import { BaseService } from '../base/service/base.service';

// Entities
import { User } from '../../database/entities';

// Repositories
import { UserRepository } from '../../database/repositories';
@Injectable()
export class UserService extends BaseService<User> {
  constructor(private readonly userRepository: UserRepository) {
    super(userRepository);
  }
}
