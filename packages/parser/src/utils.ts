import * as t from '@rekajs/types';

export const EXTERNAL_IDENTIFIER_PREFIX_SYMBOL = '$';

export const getIdentifierFromStr = (str: string) => {
  const external = str.startsWith(EXTERNAL_IDENTIFIER_PREFIX_SYMBOL);

  return t.identifier({
    name: external ? str.slice(1) : str,
    external,
  });
};
