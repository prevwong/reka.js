import * as React from 'react';

import { styled } from '@app/stitches.config';
import { IconButton } from '../button';
import { Cross2Icon } from '@radix-ui/react-icons';

const StyledInputField = styled('input', {
  background: 'transparent',

  outline: 'none',
  boxShadow: 'none',
  padding: '$1 $1',
  color: 'rgba(0,0,0,0.8)',
  transition: '0.2s ease-in',
  border: 'none',
  position: 'relative',
  width: '100%',
  fontSize: '$1',
});

const StyledBadge = styled('div', {
  padding: '$1 $2',
  borderRadius: '100px',
  background: 'rgb(0 0 0 / 11%)',
  color: 'rgba(0 0 0 / 80%)',
});

const StyledInputFieldContainer = styled('div', {
  position: 'relative',
  border: '1px solid $grayA5',
  display: 'flex',
  alignItems: 'center',
  borderRadius: '$1',
  variants: {
    transparent: {
      true: {
        border: 'none',
      },
    },
    badge: {
      true: {
        [`& ${StyledBadge}`]: {
          position: 'absolute',
          right: '5px',
          fontSize: '9px',
          transform: 'translateY(-50%)',
          top: '50%',
          opacity: 0,
          transition: '0.2s ease-in',
        },
        [`& ${StyledInputField}`]: {
          width: '100%',
          paddingRight: '80px',
        },
        [`&:hover`]: {
          [`& ${StyledBadge}`]: {
            opacity: 1,
          },
        },
      },
    },
  },
});

type InputFieldProps = React.ComponentProps<typeof StyledInputField> & {
  badge?: string;
  transparent?: boolean;
  children?: React.ReactNode;
};

export const TextField = ({
  transparent,
  badge,
  children,
  css,
  ...props
}: InputFieldProps) => {
  return (
    <StyledInputFieldContainer
      className={'text-field'}
      badge={!!badge}
      transparent={transparent}
      css={css}
    >
      <StyledInputField {...props} />
      {badge && <StyledBadge>{badge}</StyledBadge>}
      {children}
    </StyledInputFieldContainer>
  );
};

TextField.toString = () => '.text-field';

type CancellableInputFieldProps = InputFieldProps & {
  onCancel: () => void;
};

export const CancellableInputField = ({
  onCancel,
  ...props
}: CancellableInputFieldProps) => {
  return (
    <TextField
      {...props}
      css={{
        ...(props.css || {}),
        [`& ${IconButton}`]: {
          opacity: 0,
        },
        [`&:hover`]: {
          [`& ${IconButton}`]: {
            opacity: 1,
          },
        },
      }}
    >
      <IconButton
        css={{
          background: 'none',
          border: 'none',
          mr: '$1',
        }}
        onClick={() => {
          onCancel();
        }}
      >
        <Cross2Icon />
      </IconButton>
    </TextField>
  );
};
