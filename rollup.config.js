import path from 'path';

import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';

const shouldMinify = process.env.NODE_ENV === 'production';
const shouldIncludeInBundle = ['tslib'];

const injectPackageVersion = () => {
  const pkg = require('./package.json');

  return `
if ( typeof window !== 'undefined' ) {
  if ( !window['__REKA__'] ) {
    window['__REKA__'] = {};
  }
  
  window['__REKA__']["${pkg.name}"] = "${pkg.version}";
}
  `;
};

const createBundle = (config) => {
  return {
    input: config.input || './src/index.ts',
    output: [
      {
        file: 'dist/esm/index.mjs',
        format: 'es',
        intro: injectPackageVersion(),
        ...(config.output?.esm ?? {}),
      },
      {
        file: 'dist/cjs/index.js',
        format: 'cjs',
        intro: injectPackageVersion(),
        ...(config.output?.cjs ?? {}),
      },
    ],
    external: (id) => {
      if (config.external) {
        return config.external(id);
      }

      return (
        !id.startsWith('.') &&
        !path.isAbsolute(id) &&
        !shouldIncludeInBundle.includes(id)
      );
    },
    plugins: Array.from(
      new Set([
        commonjs(),
        nodeResolve(),
        typescript({
          declaration: false,
          declarationDir: null,
        }),
        ...(config.plugins || []),
        shouldMinify && terser(),
      ])
    ),
  };
};

export default function createRollupConfig(config) {
  return [createBundle(config)];
}
