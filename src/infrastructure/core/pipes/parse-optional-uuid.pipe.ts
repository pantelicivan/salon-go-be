import { PipeTransform, BadRequestException } from '@nestjs/common';
import { isUUID } from 'class-validator';

// Errors
import { InvalidUUID } from '../../../common/static/results/application.errors';

export class ParseOptionalUUID implements PipeTransform {
  transform(value: any): any {
    if (value && !isUUID(value)) {
      throw new BadRequestException(InvalidUUID(value));
    }
    return value;
  }
}
