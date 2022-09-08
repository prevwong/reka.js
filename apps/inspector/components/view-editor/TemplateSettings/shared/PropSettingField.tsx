import { styled } from '@app/styles/stitches.config';
import { IconButton } from '@app/components/button';
import { TextField } from '@app/components/text-field';

import { SettingField } from '../../SettingField';

export const PropSettingField = styled('div', {
  gridTemplateColumns: '60px 1fr auto',
  position: 'relative',
  gap: '0px',
  borderRadius: '$1',
  [`& ${TextField}`]: {
    borderColor: 'transparent',
  },
  [`& ${TextField}:nth-child(1)`]: {
    borderRight: '1px solid $grayA5',
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
  },
  [`& ${TextField}:nth-child(2)`]: {
    paddingRight: '$3',
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
  },
  mb: '-1px',
  [`& ${IconButton}`]: {
    mr: '$2',
    opacity: 0,
  },
  '&:hover': {
    [`& ${IconButton}`]: {
      opacity: 1,
    },
  },
});
