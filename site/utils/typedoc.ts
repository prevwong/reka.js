import path from 'path';

// Using fork of marijnh/getdocs-ts because there's a bug with Substitution types
// TODO: use upstream package once fix has been merged
import { gather, Item } from '@prevwong/getdocs-ts';

const CACHED_PACKAGE_TYPES: Record<string, Record<string, Item>> = {};

export const getTypesFromPackage = (packagePath: string) => {
  const [packageName, pathInSrc] = packagePath.split('/');

  if (CACHED_PACKAGE_TYPES[packageName]) {
    return CACHED_PACKAGE_TYPES;
  }

  const filename = path.join(
    process.cwd(),
    '../packages',
    packageName,
    `src/${pathInSrc}`
  );

  return gather({
    filename,
    basedir: path.join(process.cwd(), '../packages', packageName),
  });
};
