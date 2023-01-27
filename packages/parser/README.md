# @rekajs/parser

Parser for Reka AST. 

This package is mainly intended to provide an easy way to create Reka AST Nodes from code.

## Syntax

The Parser expects code to be written in a custom Reka-syntax. 

Apart from some syntactical differences in defining stateful variables and components, most of the syntax are identical to JSX (with some Vue/Svelte influence).

### Program

The entire `Program` Node can be parsed based on the following syntax:

```
val globalVariable1 = "hi";

component ComponentName(prop1="default value") {
    val stateVariable1 = 0;
    val stateWithBinaryExpression = 1+1;
    val stateWithBooleanExpression = false;
} => (
    <div></div>
)

component AnotherComponentName() {

} => (
    <ComponentName1 prop1="overriden value" />
)
```

### Templates

Component templates are similar to templates in JSX with some differences:

#### Text values

Text values must be written in a `<text />` tag:

```
component ComponentName() {} => (
    <text value="Hello World!" />
)
```

#### Conditionals

To conditionally render an element, specify the `@if` directive: 

```
component ComponentName(prop1) {
    val showCounter = false;
} => (
    <div @if={showCounter}>

    </div>
)
```

#### Foreach

To render an element for each item in a list, specify the `@each` directive:

```
val items = ["a", "b", "c"];

component ComponentName(prop1) {

} => (
    <div @each={item in items}>
        <text value={item} />
    </div>
)
```

Specifying index variable:
```
<div @each={(item, i) in items}>
    <text value={i + " " + item} />
</div>
```

#### Children

A component can accept children elements by rendering the `<slot />` element:

```
component Button() {} => (
    <button>
        <slot />
    </button>
)

component App() {} => (
    <div>
        <Button>
            <text value="Click me!" />
        </Button>
    </div>
)
```

