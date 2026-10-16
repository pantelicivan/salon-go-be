import { BadRequestException } from '@nestjs/common';

// Contracts
import { FileSize, MulterFile } from './contracts/file.contracts';

// Static
import { FileTypeEnum } from './static';

/**
 * Validates the given file's format.
 * @param req - Request
 * @param file - The uploaded file.
 * @param callback - Callback function.
 */
export const fileFilter = (req, file: MulterFile, callback): any => {
  if (
    !file.originalname
      .toLowerCase()
      .match(/\.(jpg|jpeg|png|gif|svg|pdf|mp3|mp4|gif|docs|doc|docx)$/)
  ) {
    return callback(new BadRequestException('File format invalid!'));
  }
  callback(null, true);
};

/**
 * Validates if the uploaded file is image.
 * @param req - Request
 * @param file - The uploaded file.
 * @param callback - Callback function.
 */
export const imageFileFilter = (req, file: MulterFile, callback): any => {
  if (!file.originalname.toLowerCase().match(/\.(jpg|jpeg|png|gif|svg)$/)) {
    return callback(new BadRequestException('Only image files are allowed!'));
  }
  callback(null, true);
};

/**
 * Transforms common mime file types to domain enum.
 * @param assertedFileType - Mime file type
 * @returns {FileTypeEnum} - Domain file enum
 */
const fileTypeTransformer = (assertedFileType: string): FileTypeEnum => {
  switch (assertedFileType) {
    case 'image':
      return FileTypeEnum.IMAGE;
    case 'video':
      return FileTypeEnum.VIDEO;
    case 'audio':
      return FileTypeEnum.AUDIO;
    case 'application':
      return FileTypeEnum.DOCUMENT;
    default:
      FileTypeEnum.DOCUMENT;
  }
  return FileTypeEnum.DOCUMENT;
};

/**
 * Determines file's type and extension.
 * @param file - Uploaded file
 * @returns File's type and extensions.
 */
export const determineFileTypeAndExtension = (
  file: MulterFile,
): { type: FileTypeEnum; extension: string; mimeType: string } => {
  const split = file.mimetype.split('/');
  const type = fileTypeTransformer(split[0]);
  const extension = split[1];
  return {
    type,
    extension,
    mimeType: file.mimetype,
  };
};

/**
 * Calculate new dimension for resize before upload
 * @param currentWidth
 * @param currentHeight
 * @param maxSize
 * @returns New width and height
 */
export const calculateNewDimension = (
  currentWidth: number,
  currentHeight: number,
  maxSize: number,
): FileSize => {
  const biggerDimension = Math.max(currentWidth, currentHeight);
  const scalingFactor = maxSize / biggerDimension;
  return {
    width: Math.round(currentWidth * scalingFactor),
    height: Math.round(currentHeight * scalingFactor),
  };
};
