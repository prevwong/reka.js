# reka.js.org

Contains the application code for the landing page editor and documentation.

The site is built with [Next.js](https://nextjs.org)

## Updating the initial Editor state

The editor is multiplayer-enabled via the `@rekajs/collaboration` package and it uses the WebRTC connector.

To update the initial state used in the editor, you'll need to:-

1. Update the Reka code in `/constants/dummy-program.ts`
2. Run `pnpm encode-dummy-program` to generate the Yjs update which will be applied when the editor is initialized
