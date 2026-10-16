import { Injectable, Inject } from '@nestjs/common';
import {
  S3,
  ObjectIdentifier,
  PutObjectCommand,
  PutObjectCommandInput,
  PutObjectCommandOutput,
  DeleteObjectsCommand,
  DeleteObjectsCommandInput,
  DeleteObjectsOutput,
} from '@aws-sdk/client-s3';
import { v4 as uuid } from 'uuid';
import sharp from 'sharp';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

// Services
import { ConfigService } from '../../../infrastructure/config/config.service';

// Entities
import { File } from '../../../database/entities';

// Repositories
import { FileRepository } from '../../../database/repositories';

// Contracts
import { MulterFile } from '../contracts/file.contracts';
import { FileManagementProvider } from './file-management-provider.interface';

// Async results
import {
  AsyncResult,
  Error,
  Success,
} from '../../../infrastructure/core/results/errors/result';

// Errors
import { FileUploadFailed } from '../static/results/file-management.errors';

// Static
import {
  FileTypeEnum,
  FILE_DIRECTORIES,
  ORIGINAL_FILE_MAX_SIZE,
  THUMBNAIL_FILE_SIZE,
} from '../static';
import { FeatureFlagEnum } from '../../../common/static/application.static';

// Utils
import {
  calculateNewDimension,
  determineFileTypeAndExtension,
} from '../file-management.utils';

@Injectable()
export class S3Provider implements FileManagementProvider {
  // S3 bucket's name.
  private BUCKET_NAME: string;
  // Base upload path of the files.
  private BASE_PATH: string;
  // S3 bucket's location
  private BUCKET_LOCATION: string;
  // S3 instance.
  private s3: S3;

  constructor(
    @Inject(ConfigService) private configService: ConfigService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private readonly fileRepository: FileRepository,
  ) {
    this.BUCKET_NAME = configService.get('AWS_S3_BUCKET_NAME');
    this.BASE_PATH = configService.get('AWS_S3_BASE_PATH');
    this.BUCKET_LOCATION = configService.get('AWS_S3_BUCKET_LOCATION');
    this.s3 = new S3({
      credentials: {
        accessKeyId: configService.get('AWS_KEY_ID'),
        secretAccessKey: configService.get('AWS_KEY_SECRET'),
      },
      region: configService.get('AWS_REGION'),
      endpoint: configService.get('AWS_CDN'),
    });
  }

  /**
   * Uploads file to the S3 bucket.
   * @param {MulterFile} uploadedFile - Uploaded file.
   * @param {string | null} dir - Specified directory for the file.
   * @returns {File} - File entity saved to the database.
   * @throws {BadRequestException} - File upload failed.
   */
  async uploadFile(
    uploadedFile: MulterFile,
    dir: string | null = null,
  ): AsyncResult<File, FileUploadFailed> {
    const { type, extension, mimeType } =
      determineFileTypeAndExtension(uploadedFile);
    let fileBuffer = uploadedFile.buffer;

    // Large image resize feature check
    if (
      this.configService.featureEnabled(FeatureFlagEnum.RESIZE_BIG_IMAGES) &&
      type == FileTypeEnum.IMAGE
    ) {
      fileBuffer = await this.resizeBigImage(fileBuffer);
    }

    // Preparing upload parameters.
    const params: PutObjectCommandInput = {
      Key: this.generatePath(extension, dir ?? FILE_DIRECTORIES[type]),
      Bucket: this.BUCKET_NAME,
      Body: fileBuffer,
      ACL: 'public-read',
      ContentType: mimeType,
      ContentDisposition: 'inline',
    };

    try {
      // Uploading file to S3 bucket based on the prepared parameters.
      const s3Response: PutObjectCommandOutput = await this.s3.send(
        new PutObjectCommand(params),
      );
      this.logger.info('File uploaded:', { s3Response });

      // Images thumbnail feature check
      let thumbnailKey: string | null = null;
      if (
        this.configService.featureEnabled(
          FeatureFlagEnum.CREATE_IMAGE_THUMBNAILS,
        ) &&
        type === FileTypeEnum.IMAGE
      ) {
        thumbnailKey = await this.uploadImageThumbnail(
          fileBuffer,
          extension,
          mimeType,
        );
      }
      const s3ObjectUrl = `https://${this.BUCKET_NAME}.${this.BUCKET_LOCATION}`;

      // Saving the file to the database.
      const file = await this.fileRepository.create({
        url: s3ObjectUrl + `/${params.Key}`,
        key: params.Key,
        type: type,
        mimeType: mimeType,
        thumbnailKey,
        thumbnailUrl: thumbnailKey ? s3ObjectUrl + `/${thumbnailKey}` : null,
      });
      return Success(file);
    } catch (error) {
      this.logger.error('S3 upload error.', {
        service: S3Provider.name,
        file: {
          key: params.Key,
          bucket: params.Bucket,
          ACL: params.ACL,
          contentType: params.ContentType,
          contentDisposition: params.ContentDisposition,
        },
        error,
      });
      return Error(FileUploadFailed());
    }
  }

  /**
   * Generates full upload path for the file based on config's base path and supplied file's extension and directory.
   * @param extension - File extension.
   * @param dir - Specified directory for the file.
   * @returns {string} File upload path.
   */
  private generatePath(extension: string, dir: string): string {
    return `${this.BASE_PATH}${dir ? `/${dir}` : ''}/${uuid()}.${extension}`;
  }

  /**
   * Resize the image without changing its format.
   * If something other than an image is passed it will return buffer of original file.
   * @param fileBuffer
   * @param maxSize
   * @throws Resizing error.
   * @returns Resized image buffer
   */
  private async resizeBigImage(
    fileBuffer: Buffer,
    maxSize = ORIGINAL_FILE_MAX_SIZE,
  ): Promise<Buffer> {
    try {
      const image = sharp(fileBuffer);
      const imageMetaData = await image.metadata();
      if (
        !imageMetaData.width ||
        !imageMetaData.height ||
        (imageMetaData.width <= maxSize && imageMetaData.height <= maxSize)
      ) {
        return fileBuffer;
      }

      const { width: newWidth, height: newHeight } = calculateNewDimension(
        imageMetaData.width,
        imageMetaData.height,
        maxSize,
      );

      return image.resize(newWidth, newHeight).toBuffer();
    } catch (error) {
      this.logger.error('Resizing error', {
        service: S3Provider.name,
        error,
      });

      throw error;
    }
  }

  /**
   * Generates and uploads a thumbnail for the given image.
   * @param fileBuffer - Uploaded file's buffer.
   * @param extension - File's extension.
   * @param mimeType - File's mime type.
   * @returns Uploaded file key.
   */
  private async uploadImageThumbnail(
    fileBuffer: Buffer,
    extension: string,
    mimeType: string,
  ): Promise<string | null> {
    const thumbnailBuffer = await sharp(fileBuffer)
      .resize(THUMBNAIL_FILE_SIZE.WIDTH, THUMBNAIL_FILE_SIZE.HEIGHT)
      .toBuffer();

    const thumbnailParams: PutObjectCommandInput = {
      Key: this.generatePath(
        extension,
        `${FILE_DIRECTORIES[FileTypeEnum.IMAGE]}/thumbnails`,
      ),
      Bucket: this.BUCKET_NAME,
      Body: thumbnailBuffer,
      ACL: 'public-read',
      ContentType: mimeType,
      ContentDisposition: 'inline',
    };

    await this.s3.send(new PutObjectCommand(thumbnailParams));

    return thumbnailParams.Key ?? null;
  }

  /**
   * Removes files from the S3 bucket.
   * @param {File[]} files - Files to be removed from the S3 and the DB.
   * @returns Boolean indicating if any files have been removed.
   */
  async removeFiles(files: File[]): Promise<boolean> {
    try {
      const keysForDeletion: Array<ObjectIdentifier> = [];
      for (const file of files) {
        keysForDeletion.push({ Key: file.key });
        if (file.thumbnailKey) {
          keysForDeletion.push({ Key: file.thumbnailKey });
        }
      }
      const deleteParams: DeleteObjectsCommandInput = {
        Bucket: this.BUCKET_NAME,
        Delete: {
          Objects: keysForDeletion,
        },
      };

      // Delete files from S3 bucket.
      const s3Response: DeleteObjectsOutput = await this.s3.send(
        new DeleteObjectsCommand(deleteParams),
      );
      this.logger.info('Files removed:', { s3Response });

      // Delete files from the database.
      return this.fileRepository.deleteFiles(files);
    } catch (error) {
      this.logger.error('S3 remove error.', {
        service: S3Provider.name,
        files: files,
        error,
      });
      return false;
    }
  }
}
