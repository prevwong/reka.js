import { globalCss } from './stitches.config';

export const globalStyles = globalCss({
  '*': {
    'box-sizing': 'border-box',
  },
  '*:before': {
    'box-sizing': 'border-box',
  },
  '*:after': {
    'box-sizing': 'border-box',
  },
  html: {
    height: '100%',
  },
  body: {
    margin: 0,
    height: '100%',
  },
  '#__next': {
    height: '100%',
  },
});
