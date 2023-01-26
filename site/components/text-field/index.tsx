import { Cross2Icon } from '@radix-ui/react-icons';
import cx from 'classnames';
import * as React from 'react';

import { styled } from '@app/styles';

import { Box } from '../box';
import { IconButton } from '../button';
import { Text } from '../text';

const StyledInputField = styled('input', {
  background: 'transparent',

  outline: 'none',
  boxShadow: 'none',
  padding: '$2 $3',
  color: 'rgba(0,0,0,0.8)',
  transition: '0.2s ease-in',
  border: 'none',
  position: 'relative',
  width: '100%',
  fontSize: '$1',

  [`& ${IconButton}`]: {
    opacity: 0,
  },
  [`&:hover`]: {
    [`& ${IconButton}`]: {
      opacity: 1,
    },
  },
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
  '&.error': {
    borderColor: '$red8',
  },

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
  validate?: (value: any) => boolean;
  onCancel?: () => void;
  onCommit?: (value: any) => void;
};

export const TextField = React.forwardRef<HTMLInputElement, InputFieldProps>(
  (
    {
      className,
      transparent,
      badge,
      children,
      css,
      onCancel,
      onCommit,
      onChange,
      value,
      ...props
    },
    ref
  ) => {
    const [uncommittedValue, setUncommitedValue] = React.useState(value);
    const [hasError, setHasError] = React.useState('');

    const onCommitRef = React.useRef(onCommit);

    React.useEffect(() => {
      const { current: onCommit } = onCommitRef;

      if (!onCommit) {
        return;
      }

      setUncommitedValue(value);
    }, [value, setUncommitedValue]);

    const commitValue = () => {
      if (!onCommit) {
        return;
      }

      try {
        onCommit(uncommittedValue);
      } catch (err) {
        setHasError(String(err));
      }
    };

    const cancel = () => {
      setHasError('');
      setUncommitedValue('');

      if (!onCancel) {
        return;
      }

      onCancel();
    };

    return (
      <StyledInputFieldContainer
        badge={!!badge}
        transparent={transparent}
        css={css}
        className={cx('text-field', className, {
          error: !!hasError,
        })}
      >
        <StyledInputField
          {...props}
          value={onCommit ? uncommittedValue : value}
          onChange={(e) => {
            setHasError('');

            if (!onCommit && onChange) {
              onChange(e);
              return;
            }

            if (!onCommit) {
              return;
            }

            setUncommitedValue(e.target.value);
          }}
          onKeyUp={(e) => {
            if (e.key === 'Enter') {
              commitValue();
            }

            if (e.key === 'Escape') {
              cancel();
            }

            props.onKeyUp?.(e);
          }}
          ref={ref}
        />
        {badge && <StyledBadge>{badge}</StyledBadge>}
        {children}
        {onCancel && (
          <IconButton
            css={{
              background: 'none',
              border: 'none',
              mr: '$2',
            }}
            onClick={() => {
              cancel();
            }}
          >
            <Cross2Icon />
          </IconButton>
        )}
        {hasError && (
          <Box
            css={{
              position: 'absolute',
              left: 'calc(0% - 1px)',
              top: 'calc(100% - 2px)',
              width: 'calc(100% + 2px)',
              padding: '$2 $4',
              background: '$red8',
            }}
          >
            <Text size={1} css={{ color: 'white' }}>
              {hasError}
            </Text>
          </Box>
        )}
      </StyledInputFieldContainer>
    );
  }
);

TextField.toString = () => '.text-field';
