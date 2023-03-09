# @rekajs/react-code-editor

## 1.0.0

### Minor Changes

- 474ecd5: fix: ts error
  fix: sync on update frame props
  feat: improve environment store (#7)
  fix: add missing function scope
  feat: add stringifier method for ArrayExpression
  fix: ensure mutations happen within .change() callback
  feat: catch side effect error
  feat: improved externals separation (#6)
  hotfix: alias variable in element @each directive
  fix: code editor lag
  feat: support expressions as template iterator (#5)
  fix: add error boundary for invalid iterator (#4)
  fix: resolver cleanup deleted global bindings (#3)
  feat: add type assert util (#2)
  fix: stringify each template directive (#1)
  fix: improve type error

### Patch Changes

- Updated dependencies [474ecd5]
  - @rekajs/core@1.0.0
  - @rekajs/codemirror@0.2.0
  - @rekajs/parser@1.0.0
  - @rekajs/react@1.0.0
  - @rekajs/types@0.2.0

## 0.1.0

### Patch Changes

- bcdb728: - Improved APIs and better typings
  - Separate shared utils package
  - Update Lezer grammer for Codemirror Extension
- Updated dependencies [bcdb728]
  - @rekajs/codemirror@0.1.0
  - @rekajs/core@0.1.0
  - @rekajs/parser@0.1.0
  - @rekajs/react@0.1.0
  - @rekajs/types@0.1.0
