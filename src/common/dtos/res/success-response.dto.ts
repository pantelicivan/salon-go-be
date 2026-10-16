import { SuccessLike } from '../../../infrastructure/core/results/success/result';

export class SuccessDTO {
  message: string;
  code: string;

  constructor(success: SuccessLike) {
    this.message = success.message;
    this.code = success.code;
  }
}

export class SuccessResponseDTO {
  data: SuccessDTO;

  constructor(success: SuccessLike) {
    this.data = new SuccessDTO(success);
  }
}
