# @rekajs/core

## 0.1.2

### Patch Changes

- [#13](https://github.com/prevwong/reka.js/pull/13) [`dd95dd2`](https://github.com/prevwong/reka.js/commit/dd95dd26784147dacdb6feb5cff421da7b53021e) Thanks [@prevwong](https://github.com/prevwong)! - Fix classlist not cascading to components

- [`1fcfc21`](https://github.com/prevwong/reka.js/commit/1fcfc2155c15c4038fbdbf90167460cff8ab9fc5) Thanks [@prevwong](https://github.com/prevwong)! - Add `DisposableComputation` to dispose keepAlive computed values to prevent memory leaks.

- [#15](https://github.com/prevwong/reka.js/pull/15) [`170c6e3`](https://github.com/prevwong/reka.js/commit/170c6e32842c56d20c09d675b33e7b5cf4e11fb9) Thanks [@prevwong](https://github.com/prevwong)! - Rename External Globals => External Functions

## 0.1.1

### Patch Changes

- da3c4c8: fix: peer deps
  fix: ts error
  fix: sync on update frame props
  feat: improve environment store (#7)
  fix: add missing function scope
  fix: ensure mutations happen within .change() callback
  feat: catch side effect error
  feat: improved externals separation (#6)
  hotfix: alias variable in element @each directive
  feat: support expressions as template iterator (#5)
  fix: add error boundary for invalid iterator (#4)
  fix: resolver cleanup deleted global bindings (#3)
  fix: stringify each template directive (#1)

## 0.1.0

### Patch Changes

- bcdb728: - Improved APIs and better typings
  - Separate shared utils package
  - Update Lezer grammer for Codemirror Extension
- Updated dependencies [bcdb728]
  - @rekajs/types@0.1.0
  - @rekajs/utils@0.1.0
