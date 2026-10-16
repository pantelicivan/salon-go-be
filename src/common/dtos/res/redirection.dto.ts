export class RedirectionDTO {
  url: string;

  constructor(url: string) {
    this.url = url;
  }
}

export class RedirectionResponseDTO {
  data: RedirectionDTO;

  constructor(url: string) {
    this.data = new RedirectionDTO(url);
  }
}
