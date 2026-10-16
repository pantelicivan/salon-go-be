import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Services
import { AccountService } from './account.service';

// Models
import { Account, ExternalId } from '../../database/entities';

// Repositories
import {
  AccountRepository,
  ExternalIdRepository,
} from '../../database/repositories';

@Module({
  imports: [TypeOrmModule.forFeature([Account, ExternalId])],
  controllers: [],
  providers: [AccountService, AccountRepository, ExternalIdRepository],
  exports: [AccountService, AccountRepository],
})
export class AccountModule {}
