export enum FileTypeEnum {
  IMAGE = 'image',
  VIDEO = 'video',
  DOCUMENT = 'document',
  AUDIO = 'audio',
}

export const FILE_TYPES: FileTypeEnum[] = [
  FileTypeEnum.IMAGE,
  FileTypeEnum.VIDEO,
  FileTypeEnum.DOCUMENT,
  FileTypeEnum.AUDIO,
];

// Upload directories for each of the file types.
export const FILE_DIRECTORIES = {
  [FileTypeEnum.IMAGE]: 'images',
  [FileTypeEnum.VIDEO]: 'videos',
  [FileTypeEnum.DOCUMENT]: 'documents',
  [FileTypeEnum.AUDIO]: 'audio',
};

// Max file size in pixels
export const ORIGINAL_FILE_MAX_SIZE = 1024;

// Thumbnail file size in pixels
export const THUMBNAIL_FILE_SIZE = {
  WIDTH: 300,
  HEIGHT: 300,
};
