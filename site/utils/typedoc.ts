import path from 'path';

import { gather, Item } from 'getdocs-ts';

const CACHED_PACKAGE_TYPES: Record<string, Record<string, Item>> = {};

export const getTypesFromPackage = (packageName: string) => {
  if (CACHED_PACKAGE_TYPES[packageName]) {
    return CACHED_PACKAGE_TYPES;
  }

  const filename = path.join(
    process.cwd(),
    '../packages',
    packageName,
    'src/index.ts'
  );

  return gather({
    filename,
  });
};
