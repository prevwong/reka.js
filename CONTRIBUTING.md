# Contributing

Thank you for considering to contribute to Reka.js!

To get started right away, have a look at our [project tracker](https://github.com/prevwong/projects/2) to check out a list of things that we'd like to work on right now.

If you are interested in proposing a new feature or have found a bug that you'd like to fix, please file a new [issue](https://github.com/prevwong/reka.js/issues).

# Setup

## Prerequisite

The codebase uses `node >= 14.0.0` and `pnpm`. You will need to have these installed on your machine to setup the project correctly.

## Install

Run `pnpm install` in the root folder of the project to install all dependencies required by all packages and applications in the monorepo.

After this, you can run `pnpm dev` to watch and rebuild all packages in the monorepo. This command also starts the main `/site` app in development mode.

## Pull requests

Reka uses Changesets to track and publish new releases.

Therefore, when you submit a change that affects functionality (ie: fixes a bug or adds a new feature) to one of the packages (in the `/packages/` folder), then you will need to create a new Changeset by running the following command:

```bash
pnpm changeset
```

Typos and changes made to the `/examples` or the main `/site` do not require a changeset.
