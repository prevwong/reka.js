const fieldsToString = {
  type: (self) => {
    if (self.type === 'Record') {
      return 'Record<string, any>';
    }

    return self.type;
  },
  default: (self) => {
    return `${stringifyField(self.type)}`;
  },
  union: (self) => {
    return self.union.map((u) => stringifyField(u)).join(' | ');
  },
  optional: (self) => {
    return stringifyField(self.type);
  },
  node: (self) => {
    return self.node;
  },
  array: (self) => {
    return `${stringifyField(self.array)}[]`;
  },
  map: (self) => {
    return `Record<string, ${stringifyField(self.type)}>`;
  },
  model: (self) => {
    let typing = `{\n`;
    Object.keys(self.model).forEach((key) => {
      const isOptional = self.model[key].is === 'optional';

      typing += `${key}${isOptional ? '?' : ''}: ${stringifyField(
        self.model[key]
      )};\n`;
    });
    typing += '}';
    return typing;
  },
  constant: (self) => {
    return `'${self.value}'`;
  },
  any: (_) => {
    return `any`;
  },
};

const stringifyField = (field) => fieldsToString[field.is]?.(field);

module.exports = stringifyField;
