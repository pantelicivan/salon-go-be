import { Transform } from 'class-transformer';

// Utils
import { isEmpty } from '../../../../common/utils';

export const ToInteger = (): any => {
  const toPlain = Transform(
    (value) => {
      return value;
    },
    {
      toPlainOnly: true,
    },
  );
  const toClass = (target: any, key: string): any => {
    return Transform(
      (value) => {
        return valueToInteger(value);
      },
      {
        toClassOnly: true,
      },
    )(target, key);
  };
  return function (target: any, key: string) {
    toPlain(target, key);
    toClass(target, key);
  };
};

/**
 * Casts value to integer by a certain set of rules.
 * @param value
 * @returns Integer | undefined
 */
const valueToInteger = (value: any): number | undefined => {
  if (isEmpty(value)) return undefined;
  try {
    return Number.parseInt(value);
  } catch (error) {
    return undefined;
  }
};
