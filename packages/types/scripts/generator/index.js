require('../../src/types.definition');

const path = require('path');
const fs = require('fs');
const prettier = require('prettier');
const formatBuilderName = require('./formatBuilderName');
const stringifyField = require('./stringifyField');
const { Schema } = require('../../src/schema');

let typesCode = `
import { Schema, Type } from '../schema';\n
`;

const aliases = {};

for (const type in Schema.getRegistry()) {
  const schema = Schema.get(type);
  if (schema.alias) {
    schema.alias.forEach((alias) => {
      if (aliases[alias] === undefined) {
        aliases[alias] = [];
      }

      aliases[alias].push(type);
    });
  }
  typesCode += `

  type ${type}Parameters = {
    ${schema.fields
      .map(
        (field) =>
          `${field.name}${
            field.type.is === 'default' ? '?' : ''
          }: ${stringifyField(field.type)}`
      )
      .join(';')}
  }

  export ${schema.abstract ? 'abstract' : ''} class ${type} extends ${
    schema.extends || 'Type'
  } {
    ${schema.ownFields
      .map((field) => `declare ${field.name}: ${stringifyField(field.type)}`)
      .join(';')}
    constructor(${
      schema.abstract ? 'type: string,' : ''
    }value: ${type}Parameters) {
      super(${schema.abstract ? 'type' : `"${type}"`}, value)
    }
  }
  

  Schema.register("${type}", ${type});

  `;
}

for (const alias in aliases) {
  typesCode += `export type ${alias} = ${aliases[alias].join(' | ')};\n`;
}

typesCode += `export type Any = ${Object.keys(Schema.getRegistry()).join(
  '|'
)};`;

typesCode += `export type Visitor = {`;
for (const type in Schema.getRegistry()) {
  typesCode += `${type}: (node: ${type}) => any;`;
}
typesCode += `}`;

typesCode = prettier.format(typesCode, {
  parser: 'babel-ts',
  singleQuote: true,
});

let builderCode = `
import * as t from './types.generated';
`;

for (const type in Schema.getRegistry()) {
  const schema = Schema.get(type);

  if (schema.abstract) {
    continue;
  }

  builderCode += `export const ${formatBuilderName(
    type
  )} = (...args: ConstructorParameters<typeof t.${type}>) => new t.${type}(...args);`;
}

builderCode = prettier.format(builderCode, {
  parser: 'babel-ts',
  singleQuote: true,
});

const writeCodeToFile = (filepath, code) => {
  const dir = path.dirname(filepath);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(filepath, code);
};

writeCodeToFile('./src/generated/types.generated.ts', typesCode);
writeCodeToFile('./src/generated/builder.generated.ts', builderCode);
