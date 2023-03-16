#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import resolveConfig from 'tailwindcss/resolveConfig';
import prettier from 'prettier';

const OUTPUT_PATH = './constants/theme.ts';

const tailwindConfig = require('../tailwind.config.js');

let code = `
    const theme  = ${JSON.stringify(resolveConfig(tailwindConfig).theme)}
    export default theme
`;

code = prettier.format(code, {
  parser: 'babel-ts',
  singleQuote: true,
});

const dir = path.dirname(OUTPUT_PATH);

if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

fs.writeFileSync(OUTPUT_PATH, code);
