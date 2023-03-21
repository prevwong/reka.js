import * as React from 'react';

import { cn } from '@app/utils';

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'default' | 'primary' | 'secondary' | 'outline' | 'subtle' | 'link';
  size?: 'default' | 'xs' | 'xxs' | 'lg';
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { children, variant = 'default', size = 'default', className, ...props },
    ref
  ) => {
    return (
      <button
        className={cn(
          'inline-flex items-center border border-solid border-transparent justify-center rounded-md transition-colors focus:outline-none disabled:opacity-50  disabled:pointer-events-none',
          {
            'bg-transparent text-gray-500 hover:bg-black/5 hover:text-neutral-900':
              variant === 'default',
            'bg-primary/10 text-primary hover:bg-primary/20':
              variant === 'primary',
            'bg-purple-100 text-purple-600 hover:bg-purple-200':
              variant === 'secondary',
            'bg-transparent border border-solid border-outline text-neutral-500 hover:bg-primary/10 hover:text-primary hover:border-transparent shadow-sm':
              variant === 'outline',
            'bg-transparent text-primary hover:bg-primary-100':
              variant === 'subtle',
            'bg-transparent text-blue-600 hover:text-blue-500':
              variant === 'link',
          },
          {
            'text-xs py-2.5 px-2.5 [&>svg]:w-4 [&>svg]:h-4': size == 'default',
            'text-xs py-1.5 px-1.5 rounded-md [&>svg]:w-3 [&>svg]:h-3':
              size === 'xs',
            'text-xs px-1 py-1 rounded-md [&>svg]:w-3 [&>svg]:h-3':
              size === 'xxs',
            'text-md px-4 py-4 rounded-md [&>svg]:w-4 [&>svg]:h-4':
              size === 'lg',
          },
          {
            'p-0': variant === 'link',
          },
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    );
  }
);

export const IconButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, size, variant, className, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        className={className}
        variant={variant}
        size={size || 'xs'}
        {...props}
      >
        {children}
      </Button>
    );
  }
);

Button.toString = () => '.btn';
IconButton.toString = () => '.icon-btn';
