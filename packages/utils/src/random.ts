import { customAlphabet } from 'nanoid';

const NANOID_ALPHABET =
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

const nanoid = customAlphabet(NANOID_ALPHABET, 21);

export const getRandomId = () => {
  return nanoid();
};
