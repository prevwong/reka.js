import { Cross2Icon } from '@radix-ui/react-icons';
import * as React from 'react';

import { cn } from '@app/utils';

import { IconButton } from '../button';

type TextFieldProps = React.DetailedHTMLProps<
  React.InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
> & {
  inputClassName?: string;
  badge?: string;
  transparent?: boolean;
  children?: React.ReactNode;
  validate?: (value: any) => boolean;
  onCancel?: () => void;
  onCommit?: (value: any, setValue: (value?: string) => void) => void;
};

export const TextField = React.forwardRef<HTMLInputElement, TextFieldProps>(
  (
    {
      inputClassName,
      className,
      transparent,
      badge,
      children,
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

    const commitValue = () => {
      if (!onCommit) {
        return;
      }

      try {
        onCommit(uncommittedValue, (value) => {
          setUncommitedValue(value || '');
        });
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
      <div
        className={cn(
          'group flex-1 relative border border-solid border-outline flex items-center rounded-md shadow-sm',
          {
            'border-red-400': !!hasError,
            'border-none': transparent,
          },
          className
        )}
      >
        <input
          {...props}
          className={cn(
            'bg-transparent outline-none shadow-none py-1.5 px-3 text-black/80 transition border-none relative w-full text-xs',
            inputClassName
          )}
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
        {badge && (
          <div className="absolute right-[5px] top-[50%] -translate-y-[50%] transition text-xss opacity-0 group-hover:opacity-1 px-2 py-1 rounded-full bg-black/10 text-black/80">
            {badge}
          </div>
        )}
        {children}
        {onCancel && (
          <IconButton
            className="bg-none border-none mr-px opacity-0 group-hover:opacity-100"
            onClick={() => {
              cancel();
            }}
          >
            <Cross2Icon />
          </IconButton>
        )}
        {hasError && (
          <div className="absolute left-0 top-full w-full text-xs px-3 py-3 bg-red-300 text-white z-2">
            {hasError}
          </div>
        )}
      </div>
    );
  }
);

TextField.toString = () => '.text-field';
