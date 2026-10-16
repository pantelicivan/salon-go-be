import { registerDecorator, ValidationOptions } from 'class-validator';
import { isToday, isFuture } from 'date-fns';

export function IsFutureDate(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string): void {
    registerDecorator({
      name: 'IsFutureDate',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      options: {
        message: 'Please provide a date in the future.',
        ...validationOptions,
      },
      validator: {
        validate(data: string | Date) {
          const date = new Date(data);
          return isToday(date) || isFuture(date);
        },
      },
    });
  };
}
