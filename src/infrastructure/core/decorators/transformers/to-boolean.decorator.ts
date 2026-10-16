import { Transform } from 'class-transformer';

const ToBoolean = (): any => {
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
        return valueToBoolean(value);
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
const valueToBoolean = (value: any): boolean | undefined => {
  if (typeof value == 'object') {
    value = value?.value;
  }
  if (value === null || value === undefined) {
    return undefined;
  }
  if (typeof value === 'boolean') {
    return value;
  }
  if (typeof value == 'string') {
    if (['true', 'on', 'yes', '1'].includes(value.toLowerCase())) {
      return true;
    }
    if (['false', 'off', 'no', '0'].includes(value.toLowerCase())) {
      return false;
    }
  }
  return undefined;
};

export { ToBoolean };
