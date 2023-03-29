import * as DialogPrimitive from '@radix-ui/react-dialog';
import { Cross2Icon } from '@radix-ui/react-icons';
import * as React from 'react';

import { IconButton } from '../button';

export type ModalProps = {
  isOpen?: boolean;
  onClose?: () => void;
  trigger?: React.ReactElement;
  children?: React.ReactNode;
  title?: string;
  description?: string;
};

export const Modal = (props: ModalProps) => {
  return (
    <DialogPrimitive.Root
      open={props.isOpen}
      onOpenChange={(isOpen) => {
        if (!isOpen && props.onClose) {
          props.onClose();
        }
      }}
    >
      {props.trigger && (
        <DialogPrimitive.DialogTrigger asChild>
          {props.trigger}
        </DialogPrimitive.DialogTrigger>
      )}
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className="w-full h-full left-0 top-0 bg-black/60 fixed backdrop-blur-md animate-show z-50"
          onClick={(e) => {
            e.stopPropagation();
            props.onClose?.();
          }}
        />
        <div
          className="bg-white rounded-md shadow-xl fixed top-[50%] left-[50%] [transform:translate(-50%,-50%)] w-[90vw] max-w-[450px] max-h-[85vh] px-5 py-5 z-50 focus:outline-none animate-modalShow"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mb-8">
            {props.title && (
              <DialogPrimitive.Title className="font-medium text-xl">
                {props.title}
              </DialogPrimitive.Title>
            )}
            {props.description && (
              <DialogPrimitive.Description className="text-md my-4 leading-md">
                {props.description}
              </DialogPrimitive.Description>
            )}
          </div>
          {props.children}
          <DialogPrimitive.DialogClose asChild>
            <IconButton
              size="default"
              className="absolute top-3.5 right-3 [&>svg]:w-4 [&>svg]:h-4"
            >
              <Cross2Icon />
            </IconButton>
          </DialogPrimitive.DialogClose>
        </div>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};
