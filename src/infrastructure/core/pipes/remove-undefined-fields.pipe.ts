import { BadRequestException, PipeTransform } from '@nestjs/common';

// Errors
import { InvalidPayload } from '../../../common/static/results/application.errors';

export class RemoveUndefinedFields implements PipeTransform {
  transform(value: any): any {
    const removeUndefinedFields = (obj: any): any => {
      Object.keys(obj).forEach((key) => {
        if (obj[key] && typeof obj[key] === 'object')
          removeUndefinedFields(obj[key]);
        else if (obj[key] === undefined) delete obj[key];
      });
      return obj;
    };
    if (Array.isArray(value)) {
      throw new BadRequestException(InvalidPayload());
    }
    if (typeof value === 'object') {
      return removeUndefinedFields(value);
    }
    return value;
  }
}
