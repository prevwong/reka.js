require("../../src/types.definition");

const fs = require("fs");
const prettier = require("prettier");
const formatBuilderName = require("./formatBuilderName");
const stringifyField = require("./stringifyField");
const { Schema } = require("../../src/schema");

let code = `
import { Schema, Type, TypeProperties } from './schema';\n
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
  code += `
  export ${schema.abstract ? "abstract" : ""} class ${type} extends ${
    schema.extends || "Type"
  } {
    ${schema.ownFields
      .map(
        (field) =>
          `declare ${field.name}${
            field.type.is === "optional" ? "?" : ""
          }: ${stringifyField(field.type)}`
      )
      .join(";")}
    constructor(${
      schema.abstract ? "type: string," : ""
    }value: TypeProperties<${type}>) {
      super(${schema.abstract ? "type" : `"${type}"`}, value)
    }
  }
  

  Schema.register("${type}", ${type});

  ${
    schema.abstract
      ? ""
      : `export const ${formatBuilderName(
          type
        )} = (...args: ConstructorParameters<typeof ${type}>) => new ${type}(...args);`
  }
  `;
}

for (const alias in aliases) {
  code += `export type ${alias} = ${aliases[alias].join(" | ")};\n`;
}

code += `export type Any = ${Object.keys(Schema.getRegistry()).join("|")};`;

code += `export type Visitor = {`;
for (const type in Schema.getRegistry()) {
  code += `${type}: (node: ${type}) => any;`;
}
code += `}`;

code = prettier.format(code, {
  parser: "babel-ts",
});
fs.writeFileSync("./src/types.generated.ts", code);
