@include "packages/parser/README.md"

## API Reference

!start-typedoc parser/index.ts Parser

!start-example

```tsx
import { Parser } from '@rekajs/parser';

Parser.stringify(...);
Parser.parse(...);
```
!end-example

!start-example parseProgram

```tsx
import * as t from '@rekajs/types';
import { Parser } from '@rekajs/parser';

const result = Parser.parseProgram(`
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

!start-example parseExpression

```tsx
import * as t from '@rekajs/types';
import { Parser } from '@rekajs/parser';

const result = Parser.parseExpression("1+2");

console.log(result instanceof t.BinaryExpression); // true
console.log(result.left instanceof t.Literal); // true
console.log(result.left.value == 1); // true;
```

If you know the expected return type of the source string, you could pass the Type constructor as the second argument:

```tsx
Parser.parseExpression("1+1", t.BinaryExpression); 
// ok

Parser.parseExpression("10", t.BinaryExpression); 
// error, expected BinaryExpression but received Literal
```

!end-example

!start-example stringify

```tsx
import * as t from '@rekajs/types';
import { Parser } from '@rekajs/parser';

Parser.stringify(t.program({
    components: [
        t.rekaComponent({
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
