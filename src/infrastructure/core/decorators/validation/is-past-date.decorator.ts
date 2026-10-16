import { registerDecorator, ValidationOptions } from 'class-validator';
import { isToday, isPast } from 'date-fns';

export function IsPastDate(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string): void {
    registerDecorator({
      name: 'IsPastDate',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      options: {
        message: 'Please provide a date in the past.',
        ...validationOptions,
      },
      validator: {
        validate(data: string | Date) {
          const date = new Date(data);
          return isToday(date) || isPast(date);
        },
      },
    });
  };
}
