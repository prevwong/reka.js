# @composite/core

The core package of Composite. 

## API

!start-typedoc state/index.ts Composite

!start-example

```tsx
import { Composite } from '@composite/core';
import * as t from '@composite/types';

import { Header } from './path-to-header-component.tsx';

const composite = new Composite({
    globals: {
        myGlobalVariable: 0
    },
    components: [
        t.externalComponent({
            name: 'MyReactHeader',
            render: (props) => {
                return <Header {...props} />
            }
        })
    ]
});
```

!end-example

!end-typedoc

!start-typedoc state/index.ts Frame

!end-typedoc

!start-typedoc state/index.ts Extension

!end-typedoc

