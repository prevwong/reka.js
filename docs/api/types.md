@include "packages/types/README.md"

## API

@start-typedoc types/types.docs.ts classes

@end-typedoc

## Utilities

@start-typedoc types/types.docs.ts functions

!start-example match

```tsx
import * as t from '@rekajs/types';

const expr = t.literal({ value: 0 });

t.match(expr, {
  Literal: (type) => {
    // do stuff
  },
});

// If a callback for Literal is not specified,
// But a callback for the parent Type of Literal (in this case, Expression) will be used
t.match(expr, {
  Expression: (type) => {
    // do stuff
  },
});
```

!end-example

!start-example flatten

```tsx
import * as t from '@rekajs/types';

const expr = t.binaryExpression({
    left: t.literal({ value: 2 }),
    operator: '+',
    right: t.literal({ value: 4 })
});

t.flatten(expr);

// flattened
{
    root: "root-id",
    types: {
        "root-id": {
            type: "BinaryExpression",
            left: {
                $$typeId: "left-id",
            },
            operator: "+",
            right: {
                $$typeId: "right-id",
            }
        },
        "left-id": {
            type: "Literal",
            value: 2
        },
        "right-id": {
            type: "Literal",
            value: 4
        }
    }
}
```

!end-example

!start-example merge

```tsx
import * as t from '@rekajs/types';

const a = t.binaryExpression({
  left: t.literal({ value: 2 }),
  operator: '<',
  right: t.literal({ value: 4 }),
});

const b = t.binaryExpression({
  left: t.literal({ value: 10 }),
  operator: '<',
  right: t.literal({ value: 4 }),
});

t.merge(a, b);

// Changes from 'b' is applied on a
console.log(a.left.value === b.left.value); // true
```

!end-example

!start-example unflatten

```tsx
import * as t from '@rekajs/types';

const flattened = { types: {...}, root: "..." };

const type = t.unflatten(flattened)

console.log(type instanceof t.Type) // true
```

!end-example

!start-example collect

```tsx
import * as t from '@rekajs/types';

const expr = t.binaryExpression({
  left: t.literal({ value: 1 }),
  operator: '+',
  right: t.literal({ value: 2 }),
});

const collectedTypes = t.collect(expr);

// collectedTypes = [t.BinaryExpression(...), t.Literal({ value : 1 }), t.Literal({ value: 2 })]
```

!end-example

!start-example assert

```tsx
import * as t from '@rekajs/types';

t.assert(t.literal({ value: 0 }), t.Literal); // ok

t.assert(t.identifier({ name: 'counter' }), t.Literal); // throws

// Specify an optional callback to traverse and return a value from the asserted type
const expr = t.assert(
  t.binaryExpression({
    left: t.literal({ value: 1 }),
    operator: '+',
    right: t.literal({ value: 2 }),
  }),
  t.BinaryExpression,
  (value) => {
    return t.left;
  }
);
console.log(expr instanceof t.Expression); // true
```

!end-example

!start-example clone

```tsx
const original = t.binaryExpression({
  left: t.literal({ value: 1 }),
  operator: '+',
  right: t.literal({ vlalue: 2 }),
});

const clone = t.clone(original);
console.log(original === clone); // false

// By default, the clone() util maintains the original ids
console.log(original.id === clone.id); // true

// Clone with new ids via the `replaceExistingIds` option:
const cloneWithNewIds = t.clone(original, {
  replaceExistingIds: true,
});
console.log(original.id === cloneWithNewIds.id); // false
```

!end-example

@end-typedoc
