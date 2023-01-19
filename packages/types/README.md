# @rekajs/types

Package for creating and interacting with Reka data types (ie: the AST and the View)

## Installation

```
npm install @rekajs/types
```

## Creating a new Type

To create a new type, use the builder function which will return a new `Type` instance:

```tsx
import * as t from '@rekajs/types';

// Using the builder function
const literal = t.literal({
    value: 0
});
// or manually: new Literal({ value: 0 })
```

## Checking an instance's type

```tsx
import * as t from '@rekajs/types';

const literal = t.literal({ value : 0 });

console.log(literal instanceof t.Literal); // true
console.log(literal instanceof t.Expression); // true
console.log(literal instanceof t.RekaComponent); // false
```


