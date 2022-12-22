@include "packages/parser/README.md"

## API Reference

!start-typedoc parser/Parser

!start-example

```tsx
import { Parser } from '@composite/parser';

Parser.stringify(...);
Parser.parse(...);
```
!end-example

!start-example parse

```tsx
import * as t from '@composite/types';
import { Parser } from '@composite/parser';

const result = Parser.parse(`
    val globalVariable = 0;

    component Button() {} => (
        <button>
          <text value="Click me" />
        </button>
    )

    component App(){} => (
        <div>
          <Button />
        </div>
    )
`);

console.log(result instanceof t.Program); // true
console.log(result.components.length == 2); // true
console.log(result.globals.length == 1); // true
```

!end-example

!start-example parseExpressionFromSource

```tsx
import * as t from '@composite/types';
import { Parser } from '@composite/parser';

const result = Parser.parseExpressionFromSource("1+2");

console.log(result instanceof t.BinaryExpression); // true
console.log(result.left instanceof t.Literal); // true
console.log(result.left.value == 1); // true;
```

If you know the expected return type of the source string, you could pass the Type constructor as the second argument:

```tsx
Parser.parseExpressionFromSource("1+1", t.BinaryExpression); 
// ok

Parser.parseExpressionFromSource("10", t.BinaryExpression); 
// error, expected BinaryExpression but received Literal
```

!end-example

!start-example stringify

```tsx
import * as t from '@composite/types';
import { Parser } from '@composite/parser';

Parser.stringify(t.program({
    components: [
        t.compositeComponent({
            name: 'App',
            state: [
                t.val({name: "counter", init: t.literal({value: 0})})
            ],
            props: [],
            template: t.tagTemplate({
                tag: 'div',
                props: {},
                children: [
                    t.tagTemplate({
                        tag: 'text',
                        props: { value: 'Hello!' },
                        children: []
                    })
                ]
            })
        })
    ]
}));
```

The above returns the following code:
```
component App() {
    val counter = 0;
} => (
    <div>
     <text value="Hello!" />
    </div>
)
```

!end-example

!end-typedoc
