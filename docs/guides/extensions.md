# Extensions

Apart from storing the `Program` AST, the `State` could optionally store additional values that your page builder may require.

For example, let's say you want to build a page builder where your end-users are able to leave a comment on a `Template` node of a `CompositeComponent`, similar to what you could do on apps like Figma. One way to go about this is store these comments directly as part of the `State`, through an Extension.

```tsx
// TODO: example
```