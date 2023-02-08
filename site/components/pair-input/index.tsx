import { Cross2Icon } from '@radix-ui/react-icons';
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
  value: string;
  disableEditId?: boolean;
  disableEditValue?: boolean;
  onRemove?: () => void;
  onChange?: (id: string, value: string, clear: () => void) => void;
  valuePlaceholder?: string;
};

type PairInputValue = {
  id: string;
  value: string;
};

type PairInputProps = {
  values: PairInputValue[];
  valuePlaceholder?: string;
  onChange?: (id: string, value: string, type: 'update' | 'new') => void;
  onRemove?: (id: string, value: string) => void;
  onCancelAdding?: () => void;
  addingNewField?: boolean;
  emptyValuesText?: string;
};

type AddNewPairInputFieldProps = {
  onAdd: (id: string, value: string) => void;
  onCancel: () => void;
};

const AddNewPairInputField = (props: AddNewPairInputFieldProps) => {
  const commit = (id: string, value: string) => {
    if (!id || !value) {
      return;
    }

    props.onAdd(id, value);
  };

  return (
    <PairInputField
      id={''}
      value={''}
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

const PairInputField = ({
  id,
  value,
  disableEditId,
  disableEditValue,
  onRemove,
  onChange,
  valuePlaceholder,
}: PairInputFieldProps) => {
  const [newId, setNewId] = React.useState(id);
  const [newValue, setNewValue] = React.useState(value);

  const commit = () => {
    if (!newId || !newValue || !onChange) {
      return;
    }

    onChange(newId, newValue, () => {
      setNewId('');
      setNewValue('');
    });
  };

  return (
    <StyledPairInputField>
      <TextField
        value={newId}
        onChange={(e) => {
          if (disableEditId) {
            return;
          }

          setNewId(e.target.value);
        }}
        onKeyUp={(e) => {
          if (e.key !== 'Enter') {
            return;
          }

          commit();
        }}
        disabled={disableEditId}
      />
      <StyledValueFieldContainer>
        <ExpressionInput
          value={newValue}
          placeholder={valuePlaceholder}
          onChange={(newValue) => {
            setNewValue(newValue);
          }}
          onCommit={() => {
            commit();
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
};

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
