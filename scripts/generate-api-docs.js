const { gather } = require('getdocs-ts');

let items = gather({ filename: 'packages/state/src/state.ts' });

console.log('itemes', items);
