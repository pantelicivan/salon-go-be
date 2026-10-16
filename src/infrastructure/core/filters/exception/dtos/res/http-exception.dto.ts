// Contracts
import {
  FieldError,
  HttpExceptionData,
} from '../../contracts/exception.contracts';

export class HttpExceptionDTO {
  status_code: number;
  timestamp: Date;
  error_code?: string;
  error_message?: string;
  errors?: FieldError[];
  target_dto?: string;
  details?: string;

  constructor(data: HttpExceptionData) {
    this.status_code = data.statusCode;
    this.timestamp = data.timestamp;
    this.error_code = data.errorCode;
    this.error_message = data.errorMessage;
    this.errors = data.errors;
    this.target_dto = data.targetDto;
    this.details = data.details;
  }
}
