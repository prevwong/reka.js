import { uniqueNamesGenerator, colors, animals } from 'unique-names-generator';

export const isPrimitiveValue = (value: any) => {
  return value === null || typeof value !== 'object';
};

export const generateRandomName = () =>
  uniqueNamesGenerator({
    dictionaries: [animals, colors],
    separator: ' ',
    style: 'capital',
  });
