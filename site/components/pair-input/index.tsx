import { Cross2Icon } from '@radix-ui/react-icons';
import * as t from '@rekajs/types';
import * as React from 'react';

import { styled } from '@app/styles';

import { Box } from '../box';
import { IconButton } from '../button';
import { ExpressionInput } from '../expression-input';
import { Text } from '../text';
import { TextField } from '../text-field';

export const StyledPairInputField = styled('div', {
  display: 'grid',
  gridTemplateColumns: '80px 1fr',
  position: 'relative',
  gap: '0px',
  border: '1px solid $grayA5',
  '&.error': {
    borderColor: '$red8',
  },
  '&:first-child': {
    borderTopRightRadius: '$1',
    borderTopLeftRadius: '$1',
  },
  '&:last-child': {
    borderBottomRightRadius: '$1',
    borderBottomLeftRadius: '$1',
  },
  '&:not(:last-child)': {
    borderBottomColor: 'transparent',
  },
  [`& ${TextField}`]: {
    borderRadius: 0,
    border: 'none',
  },
  [`> ${TextField}`]: {
    borderRight: '1px solid $grayA5',
  },

  mb: '-1px',
  [`& ${IconButton}`]: {
    opacity: 0,
    marginRight: '0px',
  },
  '&:hover': {
    [`& ${IconButton}`]: {
      opacity: 1,
    },
  },
});

const StyledPairInputList = styled('div', {
  borderRadius: '$1',
  border: 'none',
  variants: {
    hidden: {
      true: {
        borderColor: 'transparent',
      },
    },
  },
});

const StyledValueFieldContainer = styled('div', {
  width: '100%',
  display: 'grid',
  gridTemplateColumns: '1fr auto',
  position: 'relative',
});

type PairInputFieldProps = {
  id: string;
  value: t.Expression | null;
  disableEditId?: boolean;
  disableEditValue?: boolean;
  onRemove?: () => void;
  onChange?: (id: string, value: t.Expression, clear: () => void) => void;
  valuePlaceholder?: string;
};

type PairInputValue = {
  id: string;
  value: t.Expression | null;
};

type PairInputProps = {
  values: PairInputValue[];
  valuePlaceholder?: string;
  onChange?: (id: string, value: t.Expression, type: 'update' | 'new') => void;
  onRemove?: (id: string, value: t.Expression | null) => void;
  onCancelAdding?: () => void;
  addingNewField?: boolean;
  emptyValuesText?: string;
};

type AddNewPairInputFieldProps = {
  onAdd: (id: string, value: t.Expression) => void;
  onCancel: () => void;
};

const AddNewPairInputField = (props: AddNewPairInputFieldProps) => {
  const domRef = React.useRef<HTMLDivElement | null>(null);

  const commit = (id: string, value: t.Expression) => {
    if (!id || !value) {
      return;
    }

    props.onAdd(id, value);

    const { current: dom } = domRef;

    if (!dom) {
      return;
    }

    const idFieldDom = dom.querySelector(
      '.pair-input-id-field input'
    ) as HTMLInputElement;

    if (!idFieldDom) {
      return;
    }

    idFieldDom.focus();
    idFieldDom.setSelectionRange(0, 0);
  };

  return (
    <PairInputField
      ref={domRef}
      id={''}
      value={null}
      onRemove={() => {
        props.onCancel();
      }}
      onChange={(id, value, clear) => {
        commit(id, value);

        clear();
      }}
    />
  );
};

const PairInputField = React.forwardRef<HTMLDivElement, PairInputFieldProps>(
  (
    {
      id,
      value,
      disableEditId,
      disableEditValue,
      onRemove,
      onChange,
      valuePlaceholder,
    },
    ref
  ) => {
    const [newId, setNewId] = React.useState(id);
    const [newValue, setNewValue] = React.useState(value);

    const clear = React.useCallback(() => {
      setNewId('');
      setNewValue(null);
    }, [setNewId, setNewValue]);

    React.useEffect(() => {
      setNewValue(value);
    }, [value]);

    return (
      <StyledPairInputField ref={ref}>
        <TextField
          className="pair-input-id-field"
          value={newId}
          onChange={(e) => {
            setNewId(e.target.value);
          }}
          onKeyUp={(e) => {
            if (e.key !== 'Enter') {
              return;
            }

            if (!newId || !value || !onChange) {
              return;
            }

            onChange(newId, value, clear);
          }}
          disabled={disableEditId}
        />
        <StyledValueFieldContainer>
          <ExpressionInput
            value={newValue}
            placeholder={valuePlaceholder}
            onCommit={(value) => {
              if (!onChange) {
                return;
              }

              setNewValue(value);
              onChange(newId, value, clear);
            }}
            disable={disableEditValue}
          />
          <IconButton
            transparent
            onClick={() => {
              if (!onRemove) {
                return;
              }

              onRemove();
            }}
          >
            <Cross2Icon />
          </IconButton>
        </StyledValueFieldContainer>
      </StyledPairInputField>
    );
  }
);

export const PairInput = (props: PairInputProps) => {
  return (
    <StyledPairInputList
      hidden={props.values.length === 0 && !props.addingNewField}
    >
      {props.values.map(({ id, value }) => {
        return (
          <PairInputField
            disableEditId
            key={id}
            id={id}
            value={value}
            onRemove={() => {
              props.onRemove?.(id, value);
            }}
            onChange={(id, value) => {
              props.onChange?.(id, value, 'update');
            }}
            valuePlaceholder={props.valuePlaceholder}
          />
        );
      })}
      {!props.addingNewField && props.values.length === 0 && (
        <Box>
          <Text size={1} css={{ color: '$gray11' }}>
            {props.emptyValuesText || 'No values yet'}
          </Text>
        </Box>
      )}
      {props.addingNewField && (
        <AddNewPairInputField
          onAdd={(id, value) => {
            props.onChange?.(id, value, 'new');
            props.onCancelAdding?.();
          }}
          onCancel={() => {
            props.onCancelAdding?.();
          }}
        />
      )}
    </StyledPairInputList>
  );
};
