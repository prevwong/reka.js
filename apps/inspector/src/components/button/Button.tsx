import * as React from 'react';
import { styled } from '@app/stitches.config';

const StyledButton = styled('button', {
  backgroundColor: '$whiteA12',
  borderRadius: '3px',
  fontSize: '12px',
  border: '1px solid $gray6',
  boxShadow: 'rgb(0 0 0 / 7%) 0px 1px 1px',
  outline: 'none',
  padding: '$1 $2',
  color: '$blackA11',
  fontWeight: '500',
  '&:hover': {
    backgroundColor: '$grayA2',
  },
  variants: {
    variant: {
      dark: {
        backgroundColor: '$grayA12',
        color: '$white12',
        borderColor: '$grayA11',
        '&:hover': {
          borderColor: 'transparent',
          backgroundColor: '$grayA10',
        },
      },
      indigo: {
        backgroundColor: '$indigoA9',
        borderColor: '$indigoA7',
        color: '$whiteA12',
        '&:hover': {
          backgroundColor: '$indigoA10',
        },
      },
    },
  },
});

type ButtonProps = React.ComponentProps<typeof StyledButton>;

export const Button = ({ children, ...props }: ButtonProps) => {
  return (
    <StyledButton className="btn" {...props}>
      {children}
    </StyledButton>
  );
};

Button.toString = () => '.btn';
