// Contracts
import { ErrorObject } from '../../../../infrastructure/core/results/errors/result';

export type FileMissing = ErrorObject<'fileMissing'>;
export function FileMissing(): FileMissing {
  return {
    code: 'fileMissing',
    message: 'File is missing.',
  };
}

export type FileUploadFailed = ErrorObject<'fileUploadFailed'>;
export function FileUploadFailed(): FileUploadFailed {
  return {
    code: 'fileUploadFailed',
    message: 'File upload failed.',
  };
}
