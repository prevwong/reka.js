require('../../src/types.definition');

const path = require('path');
const fs = require('fs');
const prettier = require('prettier');
const formatBuilderName = require('./formatBuilderName');
const stringifyField = require('./stringifyField');
const { Schema } = require('../../src/schema');
const { DefaultValidator } = require('../../src/validators');

let typesCode = `
import { Schema } from '../schema';\n
import { Type, TypeConstructorOptions  } from '../node';\n
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

  if (schema.fields.length > 0) {
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
    `;
  }

  const constructorArgs = [];
  const superCtorParams = [];
  const isRootType = !schema.extends;

  if (schema.abstract) {
    constructorArgs.push('type: string');
    superCtorParams.push('type');
  } else {
    superCtorParams.push(`"${type}"`);
  }

  if (schema.fields.length > 0 || isRootType) {
    const paramsType = schema.fields.length ? `${type}Parameters` : 'any';
    const isOptional =
      schema.fields.length === 0 ||
      schema.fields.every((field) => field.type instanceof DefaultValidator);

    constructorArgs.push(`value${isOptional ? '?' : ''}: ${paramsType}`);
    superCtorParams.push('value');
  }

  constructorArgs.push(`opts?: Partial<TypeConstructorOptions>`);
  superCtorParams.push(`opts`);

  typesCode += `
  export ${schema.abstract ? 'abstract' : ''} class ${type} extends ${
    schema.extends || 'Type'
  } {
    // Type Hack: in order to accurately use type predicates via the .is() util method
    // @ts-ignore
    private declare __is${type}?: string;

    ${schema.ownFields
      .map((field) => `declare ${field.name}: ${stringifyField(field.type)}`)
      .join(';')}
    constructor(${constructorArgs.join(',')}) {
      super(${superCtorParams.join(',')})
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
