import { BadRequestException, PipeTransform } from '@nestjs/common';

// Errors
import { DateFormatError } from '../../../common/static/results/application.errors';

// Static
import { DATE_REGEX } from '../../../common/static/regex.constants';

export class ParseOptionalDate implements PipeTransform {
  transform(value: any): any {
    if (!value) {
      return;
    }
    if (typeof value === 'string' && DATE_REGEX.test(value)) {
      return value;
    }
    throw new BadRequestException(DateFormatError('2022-09-26'));
  }
}
