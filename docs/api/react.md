# @rekajs/react

Contains React-specific APIs for Reka.

> Work in progress

## Usage

Wrap your React editor with the `RekaProvider` component:

```tsx
import { Reka } from '@rekajs/core';
import { RekaProvider } from '@rekajs/react';

import * as React from 'react';

const reka = Reka.create();

reka.load(...);

export const App = () => {
    return (
        <RekaProvider reka={reka}>
            ...
        </RekaProvider>
    )
}
```

The Reka instance can be accessed anywhere within the provider via the `useReka` hook:

```tsx
const Editor = () => {
    const { reka } = useReka();

    return (
        ...
    )
}
```

The `useReka` hook optionally accepts a callback to collect values from Reka data types:

```tsx
const Editor = () => {
  const { componentNames } = useReka((reka) => ({
    componentNames: reka.state.program.components.map(
      (component) => component.name
    ),
  }));

  return (
    <div>
      {componentNames.map((name) => (
        <h2 key={name}>{name}</h2>
      ))}
    </div>
  );
};
```
