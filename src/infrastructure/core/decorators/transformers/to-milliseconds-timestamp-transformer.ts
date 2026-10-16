import { Transform } from 'class-transformer';
import { isEmpty } from 'class-validator';

const ToMillisecondsTimestamp = (): any => {
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
        return valueToMillisecondsTimestamp(value);
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

const valueToMillisecondsTimestamp = (value: any): number | undefined => {
  let timestamp = parseInt(value.value);

  if (isEmpty(timestamp) || typeof timestamp != 'number') return undefined;

  // Timestamp in seconds will have 10 digits for another 200 years.
  if (timestamp.toString().length == 10) {
    timestamp *= 1000;
  }

  // Timestamp in milliseconds will have 13 digits for another 200 years.
  if (timestamp.toString().length != 13) {
    return undefined;
  }

  return timestamp;
};

export { ToMillisecondsTimestamp };
