import * as ToggleGroupPrimitive from '@radix-ui/react-toggle-group';

import { styled } from '@app/styles';

export const ToggleGroup = styled(ToggleGroupPrimitive.Root, {
  display: 'inline-flex',
  border: '1px solid $grayA5',
  borderRadius: 4,
  boxShadow: `0 2px 10px $blackA7`,
  padding: '$2 $2',
});

export const ToggleGroupItem = styled(ToggleGroupPrimitive.ToggleGroupItem, {
  all: 'unset',
  color: '$grayA11',
  display: 'flex',
  fontSize: '$1',
  lineHeight: 1,
  alignItems: 'center',
  justifyContent: 'center',
  padding: '$2 $4',

  outline: 'none',
  cursor: 'pointer',
  '&:hover': { backgroundColor: '$primary1' },
  '&[data-state=on]': {
    backgroundColor: '$primary2',
    color: '$primary5',
  },
  '&:focus': { position: 'relative', boxShadow: `none` },
});
