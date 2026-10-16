// Entities
import { File } from '../../../../database/entities';

export class FileDTO {
  url: string;
  type: string;
  mime_type: string;
  thumbnail_url: string | null;

  constructor(file: File) {
    this.url = file.url;
    this.type = file.type;
    this.mime_type = file.mimeType;
    this.thumbnail_url = file.thumbnailUrl;
  }
}

export class FileResponseDTO {
  data: FileDTO;

  constructor(file: File) {
    this.data = new FileDTO(file);
  }
}
