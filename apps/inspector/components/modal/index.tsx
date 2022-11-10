import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { styled, keyframes } from '@app/styles';
import { Button, IconButton } from '../button';
import { Cross2Icon } from '@radix-ui/react-icons';

export type ModalProps = {
  isOpen?: boolean;
  onClose?: () => void;
  trigger?: React.ReactElement;
  children?: React.ReactNode;
  title?: string;
  description?: string;
};

const overlayShow = keyframes({
  '0%': { opacity: 0 },
  '100%': { opacity: 1 },
});

const contentShow = keyframes({
  '0%': { opacity: 0, transform: 'translate(-50%, -48%) scale(.96)' },
  '100%': { opacity: 1, transform: 'translate(-50%, -50%) scale(1)' },
});

const StyledOverlay = styled(DialogPrimitive.Overlay, {
  backgroundColor: '$blackA9',
  position: 'fixed',
  inset: 0,
  backdropFilter: 'blur(10px)',
  '@media (prefers-reduced-motion: no-preference)': {
    animation: `${overlayShow} 150ms cubic-bezier(0.16, 1, 0.3, 1)`,
  },
  zIndex: '$2',
});

const StyledContent = styled(DialogPrimitive.Content, {
  backgroundColor: 'white',
  borderRadius: 6,
  boxShadow:
    'hsl(206 22% 7% / 35%) 0px 10px 38px -10px, hsl(206 22% 7% / 20%) 0px 10px 20px -15px',
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90vw',
  maxWidth: '450px',
  maxHeight: '85vh',
  padding: 25,
  '@media (prefers-reduced-motion: no-preference)': {
    animation: `${contentShow} 150ms cubic-bezier(0.16, 1, 0.3, 1)`,
  },
  '&:focus': { outline: 'none' },
  zIndex: '$2',
});

const StyledTitle = styled(DialogPrimitive.Title, {
  fontWeight: 500,
  fontSize: 17,
  marginBottom: '$4',
});

const StyledDescription = styled(DialogPrimitive.Description, {
  margin: '10px 0 20px',
  fontSize: 15,
  lineHeight: 1.5,
});

const CloseIconButton = styled(IconButton, {
  position: 'absolute',
  top: 10,
  right: 10,
});

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
        <StyledOverlay onClick={(e) => e.stopPropagation()} />
        <StyledContent onClick={(e) => e.stopPropagation()}>
          {props.title && <StyledTitle>{props.title}</StyledTitle>}
          {props.description && (
            <StyledDescription>{props.description}</StyledDescription>
          )}
          {props.children}
          <DialogPrimitive.DialogClose asChild>
            <CloseIconButton transparent>
              <Cross2Icon />
            </CloseIconButton>
          </DialogPrimitive.DialogClose>
        </StyledContent>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};
