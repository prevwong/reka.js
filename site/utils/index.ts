import { uniqueNamesGenerator, colors, animals } from 'unique-names-generator';

export * from './collaboration';

export const isPrimitiveValue = (value: any) => {
  return value === null || typeof value !== 'object';
};

export const generateRandomName = () =>
  uniqueNamesGenerator({
    dictionaries: [colors, animals],
    separator: ' ',
    style: 'capital',
  });
