# @rekajs/core

The core package of Reka. 

## API

!start-typedoc core/index.ts Reka

!start-example

```tsx
import { Reka } from '@rekajs/core';
import * as t from '@rekajs/types';

import confetti from 'canvas-confetti'
import { Header } from './path-to-header-component.tsx';

const reka = Reka.create({
   extensions: {
        states: {
            myGlobalVariable: 0
        },
        globals: reka => ({
            getGlobalVariable: () => {
                return reka.getExternalState('myGlobalVariable')
            },
            confetti: () => {
                return confetti();
            },
        }),
        components: [
            t.externalComponent({
                name: 'MyReactHeader',
                render: (props) => {
                    return <Header {...props} />
                }
            })
        ]
    } 
});
```

!end-example

!end-typedoc

!start-typedoc core/index.ts Frame

!end-typedoc

!start-typedoc core/index.ts Extension

!end-typedoc

