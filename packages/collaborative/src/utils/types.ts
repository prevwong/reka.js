export const isPrimitiveValue = (value: any) => {
  if (
    value === undefined ||
    value === null ||
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  ) {
    return true;
  }

  return false;
};

export const isLiteralObject = (value: any) => {
  if (value !== undefined && value !== null && value instanceof Object) {
    return true;
  }

  return false;
};
