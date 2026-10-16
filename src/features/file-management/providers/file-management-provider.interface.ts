// Entities
import { File } from '../../../database/entities';

// Contracts
import { MulterFile } from '../contracts/file.contracts';

// Async results
import { AsyncResult } from '../../../infrastructure/core/results/errors/result';

// Errors
import { FileUploadFailed } from '../static/results/file-management.errors';

export interface FileManagementProvider {
  uploadFile(
    file: MulterFile,
    dir?: string | null,
  ): AsyncResult<File, FileUploadFailed>;

  removeFiles(files: File[]): Promise<boolean>;
}
