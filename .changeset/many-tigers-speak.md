---
'@rekajs/core': 'patch'
---

Fix `Observer` not automatically transforming newly inserted `Type` into Mobx observables.

For example, given the following template where `each` is initially null:

```tsx
const template = t.tagTemplate({
  tag: 'div',
  props: {},
  children: [],
  each: null,
});
```

Then, if we were to set `each` to a new `ElementEach` type object:

```tsx
template.each = t.elementEach({
    ...
})
```

The above `ElementEach` should automatically be made into a Mobx observable.
