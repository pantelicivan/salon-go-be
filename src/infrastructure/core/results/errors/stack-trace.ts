export function stackTrace(): string | null {
  const { stack } = new Error();
  if (typeof stack === 'string') {
    const result = stack
      .split(/[\r\n]+/)
      .slice(3) // get rid of the Error message and this func
      .join('\n');
    return result;
  }
  return null;
}
