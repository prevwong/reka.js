# @rekajs/core

The core package of Reka.

## API

@start-typedoc core/index.ts Reka

!start-example

```tsx
import { Reka } from '@rekajs/core';
import * as t from '@rekajs/types';

import confetti from 'canvas-confetti';
import { Header } from './path-to-header-component.tsx';

const reka = Reka.create({
  externals: {
    states: {
      myGlobalVariable: 0,
    },
    functions: (reka) => ({
      getGlobalVariable: () => {
        return reka.getExternalState('myGlobalVariable');
      },
      confetti: () => {
        return confetti();
      },
    }),
    components: [
      t.externalComponent({
        name: 'MyReactHeader',
        render: (props) => {
          return <Header {...props} />;
        },
      }),
    ],
  },
});
```

!end-example

!start-example change

```tsx
reka.change(() => {
  reka.components.push(t.rekaComponent(...))
})
```

!end-example

!start-example listenToChanges

```tsx
reka.listenToChanges((payload) => {
  if (payload.event === 'add') {
    console.log('node added', payload.type);
  }

  if (payload.event === 'dispose') {
    console.log('node removed', payload.type);
  }

  if (payload.event === 'change') {
    console.log(
      'node changed',
      payload.type,
      payload.newValue,
      payload.oldValue,
      payload.name
    );
  }
});
```

!end-example

!start-example subscribe

```tsx
reka.subscribe(
  (state) => ({
    componentNames: state.program.components.map((component) => component.name),
  }),
  (collected) => {
    console.log('component names', collected.componentNames);
  }
);
```

!end-example

!start-example watch

```tsx
reka.watch(() => {
  console.log(
    'component names',
    state.program.components.map((component) => component.name)
  );
});
```

!end-example

@end-typedoc

@start-typedoc core/index.ts Frame

@end-typedoc

@start-typedoc core/index.ts Extension

@end-typedoc
