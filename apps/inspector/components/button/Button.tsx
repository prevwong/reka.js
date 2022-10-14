import * as React from 'react';
import { styled } from '@app/styles';

const StyledButton = styled('button', {
  display: 'inline-flex',
  alignItems: 'center',
  backgroundColor: '$whiteA12',
  borderRadius: '3px',
  fontSize: '10px',
  border: '1px solid $gray6',
  outline: 'none',
  padding: '$2 $3',
  color: '$blackA11',
  cursor: 'pointer',
  fontWeight: '500',
  '&:hover': {
    backgroundColor: '$grayA2',
  },
  '&[disabled]': {
    cursor: 'not-allowed',
    boxShadow: 'none',
  },
  svg: {
    width: '10px',
    height: '10px',
  },
  variants: {
    tiny: {
      true: {
        padding: '$1, $1',
      },
    },
    variant: {
      primary: {
        backgroundColor: '$indigoA9',
        borderColor: '$indigoA7',
        color: '$whiteA12',
        '&:hover': {
          backgroundColor: '$indigoA10',
        },
      },
      secondary: {
        backgroundColor: '$secondary2',
        borderColor: '$secondary2',
        color: '$secondary5',
        '&:hover': {
          backgroundColor: '$secondary3',
        },
      },
      bw: {
        backgroundColor: '#000',
        color: '#fff',
        '&:hover': {
          backgroundColor: '#222',
        },
      },
    },
    transparent: {
      true: {
        borderColor: 'transparent',
        boxShadow: 'none',
        backgroundColor: 'transparent',
      },
    },
  },
  compoundVariants: [
    {
      transparent: true,
      variant: 'primary',
      css: {
        color: '$indigoA9',
        backgroundColor: 'transparent',
        borderColor: 'transparent',
        '&:hover': {
          backgroundColor: '$indigoA3',
        },
      },
    },
  ],
});

const StyledIconButton = styled(StyledButton, {
  padding: '$2 $2',
  boxShadow: 'none',
});

type ButtonProps = React.ComponentProps<typeof StyledButton>;

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, ...props }, ref) => {
    return (
      <StyledButton ref={ref} className="btn" {...props}>
        {children}
      </StyledButton>
    );
  }
);

export const IconButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, ...props }, ref) => {
    return (
      <StyledIconButton ref={ref} className={'icon-btn'} {...props}>
        {children}
      </StyledIconButton>
    );
  }
);

Button.toString = () => '.btn';
IconButton.toString = () => '.icon-btn';
