import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, IsNull, LessThan } from 'typeorm';
import { subDays } from 'date-fns';

// Entities
import { File } from '../entities';

// Repositories
import { BaseRepository } from './base.repository';

// Contracts
import { FileAttachmentData } from '../../features/file-management/contracts/file.contracts';

// Static
import { PolymorphicContextEnum } from '../../common/static/polymorphic.static';

// Utils
import { isEmpty } from '../../common/utils';

@Injectable()
export class FileRepository extends BaseRepository<File> {
  protected alias: string;

  constructor(@InjectRepository(File) protected repo: Repository<File>) {
    super(repo);
    this.alias = 'file';
  }

  /**
   * Finds file by given file url.
   * @param url - File url.
   * @returns File if found.
   */
  findFileByUrl(url: string): Promise<File | null> {
    return this.findOne({ url });
  }

  /**
   * Finds free file by given file url. File is free if it is not attached to a model.
   * @param url - File url.
   * @returns File if found.
   */
  findFreeFileByUrl(url: string): Promise<File | null> {
    return this.repo.findOne({
      where: { url, modelId: IsNull(), modelType: IsNull() },
    });
  }

  /**
   * Finds files by given file urls.
   * @param fileUrls - File urls.
   * @returns Files.
   */
  findFilesByUrls(fileUrls: string[]): Promise<File[]> {
    return this.repo.find({ where: { url: In(fileUrls) } });
  }

  /**
   * Finds free files by given file urls. File is free if it is not attached to a model.
   * @param fileUrls - File urls.
   * @returns Files.
   */
  findFreeFilesByUrls(fileUrls: string[]): Promise<File[]> {
    return this.repo.find({
      where: { url: In(fileUrls), modelId: IsNull(), modelType: IsNull() },
    });
  }

  /**
   * File is unused if it hasn't been attached to a model in more than a day.
   * @returns Unused files.
   */
  findUnusedFiles(): Promise<File[]> {
    const dateThreshold = subDays(new Date(), 1);
    return this.repo.find({
      where: { createdAt: LessThan(dateThreshold), modelId: IsNull() },
    });
  }

  /**
   * Finds file by file model type, model id or context if provided
   * @param data - File's model type, model id and context.
   * @returns File if found
   */
  findFileByModelTypeAndModelId({
    modelId,
    modelType,
    context,
  }: FileAttachmentData): Promise<File | null> {
    return this.findOne({
      modelType: modelType,
      modelId: modelId,
      context: !isEmpty(context) ? context : PolymorphicContextEnum.DEFAULT,
    });
  }

  /**
   * Associates files with the model
   * @param file - File
   * @param data - File's model type, model id and context.
   */
  async attachFileToModel(
    file: File,
    { modelId, modelType, context }: FileAttachmentData,
  ): Promise<void> {
    if (isEmpty(file)) {
      return;
    }

    await this.updateEntity(file, {
      modelId,
      modelType,
      context: !isEmpty(context) ? context : PolymorphicContextEnum.DEFAULT,
    });
  }

  /**
   * Associates files to the model.
   * @param files - File
   * @param data - File's model type, model id and context.
   */
  async attachFilesToModel(
    files: File[],
    { modelId, modelType, context }: FileAttachmentData,
  ): Promise<void> {
    if (isEmpty(files)) {
      return;
    }

    await this.qb()
      .update(File)
      .set({
        modelId,
        modelType,
        context: !isEmpty(context) ? context : PolymorphicContextEnum.DEFAULT,
      })
      .where('id in (:...fileIds)', { fileIds: files.map((file) => file.id) })
      .execute();
  }

  /**
   * Associates files with the model
   * @param url - File url
   * @param data - File's model type, model id and context.
   */
  async attachFileToModelByUrl(
    url: string,
    { modelId, modelType, context }: FileAttachmentData,
  ): Promise<void> {
    const file = await this.findFileByUrl(url);
    if (!file) return undefined;

    this.attachFileToModel(file, { modelType, modelId, context });
  }

  /**
   * Prepares file for deletion.
   * Cron job deletes inactive files from database and from amazon s3 every day at 5am.
   * File is inactive if its model id and model type are null.
   * @param file - File entity
   */
  async detachFileModel(file: File): Promise<void> {
    await this.qb()
      .update(File)
      .set({
        modelId: null,
        modelType: null,
      })
      .where(
        `id = '${
          file.id
        }' or (model_type = '${File.getModelType()}' and model_id = '${
          file.id
        }')`,
      )
      .execute();
  }

  /**
   * Prepares files for deletion.
   * Cron job deletes inactive files from database and from amazon s3 every day at 5am.
   * File is inactive if its model id and model type are null.
   * @param files - Array of files
   */
  async detachFileModels(files: File[]): Promise<void> {
    await this.qb()
      .update(File)
      .set({
        modelId: null,
        modelType: null,
      })
      .where(
        `id in (:...ids) or (model_type = '${File.getModelType()}' and model_id in (:...ids))`,
        { ids: files.map((file) => file.id) },
      )
      .execute();
  }

  /**
   * Prepares files for deletion.
   * Cron job deletes inactive files from database and from amazon s3 every day at 5am.
   * File is inactive if its model id and model type are null.
   * @param data - File's model type, model id and context.
   */
  async detachFilesFromModel({
    modelId,
    modelType,
    context,
  }: FileAttachmentData): Promise<void> {
    let query = this.qb()
      .update(File)
      .set({
        modelId: null,
        modelType: null,
      })
      .where('model_type = :modelType', { modelType })
      .andWhere('model_id = :modelId', { modelId });

    if (!isEmpty(context)) {
      query = query.andWhere('context = :context', { context });
    }

    await query.execute();
  }

  /**
   * Deletes files by the given keys
   * @param keys
   * @returns Boolean indicating if any files were deleted.
   */
  async deleteByKeys(keys: string[]): Promise<boolean> {
    const results = await this.repo.delete({
      key: In(keys),
    });
    return !!results.affected && results.affected > 0;
  }

  /**
   * Deletes the given files.
   * @param files
   * @returns Boolean indicating if any files were deleted.
   */
  async deleteFiles(files: File[]): Promise<boolean> {
    const results = await this.repo.delete({
      id: In(files.map((file) => file.id)),
    });
    return !!results.affected && results.affected > 0;
  }
}
