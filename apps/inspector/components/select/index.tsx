import * as React from 'react';
import * as SelectPrimitive from '@radix-ui/react-select';
import { styled } from '@app/styles';
import { CheckIcon, ChevronDownIcon } from '@radix-ui/react-icons';

const StyledTrigger = styled(SelectPrimitive.SelectTrigger, {
  all: 'unset',
  display: 'inline-flex',
  alignItems: 'center',
  borderRadius: 4,
  padding: '$2 $3',
  fontSize: '$1',
  lineHeight: 1,
  gap: 5,
  color: '$grayA12',
  border: '1px solid $grayA6',
  cursor: 'pointer',
  boxShadow: `0 2px 10px $blackA7`,
  '&:hover': { backgroundColor: '$mauve3' },
  '&[data-placeholder]': { color: '$grayA12' },
});

const StyledContent = styled(SelectPrimitive.Content, {
  overflow: 'hidden',
  backgroundColor: 'white',
  borderRadius: 6,
  boxShadow:
    '0px 10px 38px -10px rgba(22, 23, 24, 0.35), 0px 10px 20px -15px rgba(22, 23, 24, 0.2)',
  zIndex: '$4',
});

const StyledViewport = styled(SelectPrimitive.Viewport, {
  padding: 5,
});

const StyledItem = styled(SelectPrimitive.Item, {
  all: 'unset',
  fontSize: '$1',
  lineHeight: 1,
  color: '$grayA12',
  borderRadius: 3,
  display: 'flex',
  alignItems: 'center',
  padding: '$2 $4 $2 25px',
  position: 'relative',
  userSelect: 'none',

  '&[data-disabled]': {
    color: '$mauve8',
    pointerEvents: 'none',
  },

  '&[data-highlighted]': {
    backgroundColor: '$primary5',
    color: '#fff',
  },
});

const StyledItemIndicator = styled(SelectPrimitive.ItemIndicator, {
  position: 'absolute',
  left: 0,
  width: 25,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
});

type SelectItem = {
  value: string;
  title: string;
};

type SelectProps = {
  items: SelectItem[];
  onChange: (value: string) => void;
  value?: string;
  placeholder?: string;
};

export const Select = (props: SelectProps) => {
  return (
    <SelectPrimitive.Root
      value={props.value || undefined}
      onValueChange={(value) => props.onChange(value)}
    >
      <StyledTrigger aria-label="Food">
        <SelectPrimitive.Value
          placeholder={props.placeholder || 'Select a value'}
        />
        <SelectPrimitive.SelectIcon>
          <ChevronDownIcon width={12} height={12} />
        </SelectPrimitive.SelectIcon>
      </StyledTrigger>
      <SelectPrimitive.Portal>
        <StyledContent>
          <StyledViewport>
            {props.items.map((item) => (
              <StyledItem key={item.value} value={item.value}>
                <SelectPrimitive.ItemText>
                  {item.title}
                </SelectPrimitive.ItemText>
                <StyledItemIndicator>
                  <CheckIcon />
                </StyledItemIndicator>
              </StyledItem>
            ))}
          </StyledViewport>
        </StyledContent>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
};
