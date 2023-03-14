import { VariantProps, cva, cx } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@app/utils';

const buttonVariants = cva(
  'inline-flex items-center border border-solid border-transparent justify-center rounded-md transition-colors focus:outline-none disabled:opacity-50  disabled:pointer-events-none ',
  {
    variants: {
      variant: {
        default:
          'bg-transparent text-gray-500 hover:bg-black/5 hover:text-neutral-900',
        primary: 'bg-primary/10 text-primary hover:bg-primary/20',
        secondary: 'bg-purple-100 text-purple-600 hover:bg-purple-200',
        outline:
          'bg-transparent border border-solid border-outline text-neutral-500 hover:bg-primary/10 hover:text-primary shadow-sm',
        subtle: 'bg-transparent text-primary hover:bg-primary-100',
        link: 'bg-transparent text-blue-600 hover:text-blue-500',
      },
      size: {
        default: 'text-xs py-2.5 px-2.5 [&>svg]:w-3.5 [&>svg]:h-3.5',
        xs: 'text-xs py-1.5 px-1.5 rounded-md [&>svg]:w-3 [&>svg]:h-3',
        xxs: 'text-xs px-1 py-1 rounded-md [&>svg]:w-3 [&>svg]:h-3',
        lg: 'text-md px-4 py-4 rounded-md [&>svg]:w-4 [&>svg]:h-4',
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
        className={cx(className)}
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
