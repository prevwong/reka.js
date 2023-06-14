# @rekajs/core

## 0.1.11

### Patch Changes

- [`78914f0`](https://github.com/prevwong/reka.js/commit/78914f0cd0b838ce827a06e4dcb7dabf7c5c4098) Thanks [@prevwong](https://github.com/prevwong)! - Group Tag/Component templates as SlottableTemplate

- [`7147a18`](https://github.com/prevwong/reka.js/commit/7147a18286c76079d41b0d6be071974592dba15a) Thanks [@prevwong](https://github.com/prevwong)! - Fix update parent path on Type upate

## 0.1.10

### Patch Changes

- [`2426fcf`](https://github.com/prevwong/reka.js/commit/2426fcfdb4bfdd03220848fffed1e510d4bf5709) Thanks [@prevwong](https://github.com/prevwong)! - Add change listener for Frame's view

- [`9030907`](https://github.com/prevwong/reka.js/commit/90309072aadb55070fe3d7255dfcb54e5e22b9fd) Thanks [@prevwong](https://github.com/prevwong)! - Fix notification on view disposal

## 0.1.9

### Patch Changes

- [`c84d9c0`](https://github.com/prevwong/reka.js/commit/c84d9c05b2483ae0a30f1a3153364d7aeb0324e9) Thanks [@prevwong](https://github.com/prevwong)! - Add getParentView method in Frame

## 0.1.8

### Patch Changes

- [#34](https://github.com/prevwong/reka.js/pull/34) [`de97826`](https://github.com/prevwong/reka.js/commit/de97826222f7006d1b0e84c51244fbfe9e434d4f) Thanks [@prevwong](https://github.com/prevwong)! - Fix template slots not passing through ExternalComponents

- [`6f81ace`](https://github.com/prevwong/reka.js/commit/6f81ace1ea03b97ef7486b7441112a9772ea2dff) Thanks [@prevwong](https://github.com/prevwong)! - Fix subscriber type

## 0.1.7

### Patch Changes

- [`5609f03`](https://github.com/prevwong/reka.js/commit/5609f03230775420b537f73b89a8a56745225053) Thanks [@prevwong](https://github.com/prevwong)! - Persist reactivity in .subscribe method

## 0.1.6

### Patch Changes

- [`ee5ad86`](https://github.com/prevwong/reka.js/commit/ee5ad8618d608280232722f62ef699c3c8ccdba8) Thanks [@prevwong](https://github.com/prevwong)! - Autogenerate frame id by default

- [`6986c1d`](https://github.com/prevwong/reka.js/commit/6986c1d7ed2e7cd81a0eaef09d6655e92d4caf52) Thanks [@prevwong](https://github.com/prevwong)! - Export ChangeListenerPayload type

- [`125a014`](https://github.com/prevwong/reka.js/commit/125a01474a90a07d40b1539293344d8e8e3fa461) Thanks [@prevwong](https://github.com/prevwong)! - Include frame id in output View

- [#25](https://github.com/prevwong/reka.js/pull/25) [`962f75a`](https://github.com/prevwong/reka.js/commit/962f75aa4e5ed4efdff72ddc0ac3744727fdd7f5) Thanks [@prevwong](https://github.com/prevwong)! - Add owner in View

## 0.1.5

### Patch Changes

- [`c1aba8e`](https://github.com/prevwong/reka.js/commit/c1aba8ee761cc4969a18817289604392504cb5ed) Thanks [@prevwong](https://github.com/prevwong)! - Fix memory leaks

- [`2203e89`](https://github.com/prevwong/reka.js/commit/2203e8956b9f26c49bedabc3b6a4b8180a449be0) Thanks [@prevwong](https://github.com/prevwong)! - Update Extension type

- [`61435db`](https://github.com/prevwong/reka.js/commit/61435dbfb88326eabe7857e43318a45459b08343) Thanks [@prevwong](https://github.com/prevwong)! - Inject package version to browser window

- Updated dependencies [[`61435db`](https://github.com/prevwong/reka.js/commit/61435dbfb88326eabe7857e43318a45459b08343)]:
  - @rekajs/utils@0.1.2

## 0.1.4

### Patch Changes

- [`b5aec26`](https://github.com/prevwong/reka.js/commit/b5aec26d55685cbc3ade66a16413ef7bf3f46e4a) Thanks [@prevwong](https://github.com/prevwong)! - Add CJS bundle

- Updated dependencies [[`b5aec26`](https://github.com/prevwong/reka.js/commit/b5aec26d55685cbc3ade66a16413ef7bf3f46e4a)]:
  - @rekajs/utils@0.1.1

## 0.1.3

### Patch Changes

- [`1cc0cfb`](https://github.com/prevwong/reka.js/commit/1cc0cfb19cf75f55bc61ba06d6b9b32e503d13f6) Thanks [@prevwong](https://github.com/prevwong)! - Remove unnecessary options for `reka.watch()`

- [`ea0a075`](https://github.com/prevwong/reka.js/commit/ea0a075059557a7143ffeae7edb632856896f137) Thanks [@prevwong](https://github.com/prevwong)! - Fix `@each` directive bugs

- [`d8cc124`](https://github.com/prevwong/reka.js/commit/d8cc124df6ec9836d996b9eb533fa6b180197e83) Thanks [@prevwong](https://github.com/prevwong)! - Fix `Observer` not automatically transforming newly inserted `Type` into Mobx observables.

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
