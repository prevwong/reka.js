import * as React from 'react';

import { styled } from '@app/stitches.config';

const StyledInputField = styled('input', {
  background: 'transparent',
  borderRadius: '$1',
  outline: 'none',
  boxShadow: 'none',
  padding: '$1 $2',
  color: 'rgba(255,255,255,0.8)',
  transition: '0.2s ease-in',
  border: '1px solid rgba(255,255,255,0.1)',
  position: 'relative',
  width: '100%',
  ['&:hover']: {
    borderColor: 'transparent',
    background: 'rgba(255,255,255,0.1)',
    color: '#fff',
  },
  ['&:focus']: {
    borderColor: 'transparent',
    background: 'rgba(255,255,255,0.1)',
    color: '#fff',
  },
});

const StyledBadge = styled('div', {
  padding: '$1 $2',
  borderRadius: '100px',
  background: 'rgb(255 255 255 / 11%)',
  color: 'rgba(255 255 255 / 80%)',
});

const StyledInputFieldContainer = styled('div', {
  position: 'relative',
  variants: {
    badge: {
      true: {
        [`& ${StyledInputField}`]: {
          fontStyle: 'italic',
          width: '100%',
          paddingRight: '80px',
        },
        [`& ${StyledBadge}`]: {
          position: 'absolute',
          right: '5px',
          fontSize: '9px',
          transform: 'translateY(-50%)',
          top: '50%',
        },
      },
    },
  },
});

type InputFieldProps = React.ComponentProps<typeof StyledInputField> & {
  badge?: string;
};

export const TextField = ({ badge, ...props }: InputFieldProps) => {
  return (
    <StyledInputFieldContainer badge={!!badge}>
      <StyledInputField {...props} />
      {badge && <StyledBadge>{badge}</StyledBadge>}
    </StyledInputFieldContainer>
  );
};
