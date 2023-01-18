import path from 'path';

import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';

const shouldMinify = process.env.NODE_ENV === 'production';
const shouldIncludeInBundle = ['tslib'];

export default function createRollupConfig(config) {
  return {
    input: config.input || './src/index.ts',
    output: config.output || [],
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
        typescript(),
        ...(config.plugins || []),
        shouldMinify && terser(),
      ])
    ),
  };
}
