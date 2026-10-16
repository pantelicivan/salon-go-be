import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Modules
import { ConfigModule } from '../../infrastructure/config/config.module';

// Services
import { FileManagementService } from './file-management.service';
import { S3Provider } from './providers/s3.provider';

// Controllers
import { FileManagementController } from './file-management.controller';

// Entities
import { File } from '../../database/entities';

// Repositories
import { FileRepository } from '../../database/repositories';

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([File])],
  controllers: [FileManagementController],
  providers: [FileManagementService, FileRepository, S3Provider],
  exports: [FileManagementService, FileRepository],
})
export class FileManagementModule {}
