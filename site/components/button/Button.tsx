import { VariantProps, cva, cx } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@app/utils';

const buttonVariants = cva(
  'inline-flex items-center border border-solid border-transparent justify-center rounded-md transition-colors focus:outline-none disabled:opacity-50  disabled:pointer-events-none ',
  {
    variants: {
      variant: {
        default: 'bg-transparent text-neutral-600 hover:bg-gray-100',
        primary: 'bg-primary/10 text-primary hover:bg-primary/20',
        secondary: 'bg-purple-100 text-purple-600 hover:bg-purple-200',
        outline:
          'bg-transparent border border-solid border-slate-200 hover:bg-slate-100 text-slate-500 shadow-sm',
        subtle: 'bg-transparent text-blue-600 hover:bg-blue-100',
        link: 'bg-transparent text-blue-600 hover:text-blue-500',
      },
      size: {
        default: 'text-xs py-3 px-3 [&>svg]:w-3.5 [&>svg]:h-3.5',
        xs: 'text-xs py-2 px-2 rounded-md [&>svg]:w-3.5 [&>svg]:h-3.5',
        xxs: 'text-xs px-1 py-1 rounded-md [&>svg]:w-3 [&>svg]:h-3',
        lg: 'h-11 px-8 rounded-md',
      },
    },
    compoundVariants: [
      {
        variant: 'link',
        className: 'p-0',
      },
    ],
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, variant, size, className, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size }), className)}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    );
  }
);

export const IconButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, size, className, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        className={cx(className, 'padding-2')}
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
