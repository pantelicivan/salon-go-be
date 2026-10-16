import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

// Providers
import { FileManagementProvider } from './providers/file-management-provider.interface';
import { S3Provider } from './providers/s3.provider';

// Entities
import { File } from '../../database/entities';

// Repositories
import { FileRepository } from '../../database/repositories';

// Contracts
import { MulterFile } from './contracts/file.contracts';

// Async results
import { AsyncResult } from '../../infrastructure/core/results/errors/result';

// Errors
import { FileUploadFailed } from './static/results/file-management.errors';

// Utils
import { isEmpty } from '../../common/utils';

@Injectable()
export class FileManagementService {
  provider: FileManagementProvider;

  constructor(
    s3Provider: S3Provider,
    private readonly fileRepository: FileRepository,
  ) {
    this.provider = s3Provider;
  }
  /**
   * Uploads a file.
   * @param {MulterFile} file - Uploaded file.
   * @param {string | null} dir - Specified directory for the file.
   * @returns {FileUploadedResponse} - Url to the uploaded file
   */
  uploadFile(
    file: MulterFile,
    dir: string | null = null,
  ): AsyncResult<File, FileUploadFailed> {
    return this.provider.uploadFile(file, dir);
  }

  /**
   * Clears unused files from the DB and CDN.
   * A file is considered invalid if it is not linked to any other entity within a time period of one day.
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async removeUnusedFiles(): Promise<void> {
    const filesToBeRemoved = await this.fileRepository.findUnusedFiles();
    if (isEmpty(filesToBeRemoved)) {
      return;
    }
    await this.provider.removeFiles(filesToBeRemoved);
  }
}
