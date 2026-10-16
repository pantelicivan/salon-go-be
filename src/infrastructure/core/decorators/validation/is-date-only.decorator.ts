import { registerDecorator, ValidationOptions } from 'class-validator';
import { DATE_REGEX } from '../../../../common/static/regex.constants';

export function IsDateOnly(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string): void {
    registerDecorator({
      name: 'IsOnlyDate',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      options: {
        message: 'Please provide date like 2020-12-28',
        ...validationOptions,
      },
      validator: {
        validate(value: any) {
          return typeof value === 'string' && DATE_REGEX.test(value);
        },
      },
    });
  };
}
