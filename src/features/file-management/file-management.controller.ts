import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { ApiBadRequestResponse, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';

// Services
import { FileManagementService } from './file-management.service';

// Decorators
import { ApiFile } from '../../infrastructure/core/decorators/api/api-file.decorator';

// Filters
import { HttpExceptionDTO } from '../../infrastructure/core/filters/exception/dtos/res/http-exception.dto';

// Contracts
import { MulterFile } from './contracts/file.contracts';

// Response DTO
import { FileResponseDTO } from './dtos/res/file.dto';

// Async results
import { isErr } from '../../infrastructure/core/results/errors/result';

// Errors
import { FileMissing } from './static/results/file-management.errors';

// Utils
import { fileFilter } from './file-management.utils';
import { isEmpty, convertMBtoB } from '../../common/utils';

@ApiTags('File Management')
@Controller('file-management')
export class FileManagementController {
  constructor(private fileManagementService: FileManagementService) {}

  /**
   * Uploads a file.
   * @param {MulterFile} uploadedFile - Uploaded file.
   * @throws {BadRequestException} - File missing or upload failed.
   * @returns {FileResponseDTO} - Uploaded file.
   */
  @Post('upload')
  @ApiConsumes('multipart/form-data')
  @ApiFile('file')
  @ApiBadRequestResponse({
    description: 'File missing or upload failed.',
    type: HttpExceptionDTO,
  })
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: convertMBtoB(
          Number.parseInt(process.env.MAX_FILE_SIZE_IN_MB ?? '50'),
        ),
      },
      fileFilter,
    }),
  )
  async fileUpload(
    @UploadedFile() uploadedFile: MulterFile,
  ): Promise<FileResponseDTO> {
    if (isEmpty(uploadedFile)) {
      throw new BadRequestException(FileMissing());
    }
    const uploadResults = await this.fileManagementService.uploadFile(
      uploadedFile,
    );
    if (isErr(uploadResults)) {
      throw new BadRequestException(uploadResults.error);
    }
    return new FileResponseDTO(uploadResults.value);
  }
}
