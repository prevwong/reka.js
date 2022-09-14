import { Cross2Icon } from '@radix-ui/react-icons';
import { styled } from '@stitches/react';
import * as React from 'react';
import { IconButton } from '../button';
import { TextField } from '../text-field';

export const StyledPairInputField = styled('div', {
  display: 'grid',
  gridTemplateColumns: '60px 1fr auto',
  position: 'relative',
  gap: '0px',
  borderBottom: '1px solid $grayA5',
  '&:last-child': {
    borderBottomColor: 'transparent',
  },
  [`& ${TextField}`]: {
    borderColor: 'transparent',
  },
  [`& ${TextField}:nth-child(1)`]: {
    borderRight: '1px solid $grayA5',
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
  },
  [`& ${TextField}:nth-child(2)`]: {
    paddingRight: '$3',
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
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
  border: '1px solid $grayA5',
  borderRadius: '$1',
  variants: {
    hidden: {
      true: {
        borderColor: 'transparent',
      },
    },
  },
});

type PairInputValue = {
  id: string;
  value: string;
};

type PairInputProps = {
  values: PairInputValue[];
  onChange?: (id: string, value: string) => void;
  onRemove?: (id: string, value: string) => void;
  onAdd?: (id: string, value: string, clear: () => void) => void;
  onCancelAdding?: () => void;
  addingNewField?: boolean;
};

type AddNewPairInputFieldProps = {
  onAdd: (id: string, value: string, clear: () => void) => void;
  onCancel: () => void;
};

const AddNewPairInputField = (props: AddNewPairInputFieldProps) => {
  const [id, setId] = React.useState('');
  const [value, setValue] = React.useState('');

  const idDomRef = React.useRef<HTMLInputElement | null>(null);
  const valueDomRef = React.useRef<HTMLInputElement | null>(null);

  const commit = () => {
    if (!id || !value) {
      return;
    }

    props.onAdd(id, value, () => {
      setId('');
      setValue('');

      const { current: idDom } = idDomRef;

      if (!idDom) {
        return;
      }

      idDom.focus();
      idDom.setSelectionRange(0, 0);
    });
  };

  return (
    <StyledPairInputField>
      <TextField
        ref={(dom) => {
          idDomRef.current = dom;
        }}
        value={id}
        onChange={(e) => {
          setId(e.target.value);
        }}
        onKeyUp={(e) => {
          if (e.key !== 'Enter') {
            return;
          }

          commit();
        }}
        onBlur={() => {
          commit();
        }}
      />
      <TextField
        ref={(dom) => {
          valueDomRef.current = dom;
        }}
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
        }}
        onKeyUp={(e) => {
          if (e.key !== 'Enter') {
            return;
          }

          commit();
        }}
        onBlur={() => {
          commit();
        }}
      />
      <IconButton
        transparent
        onClick={() => {
          props.onCancel();
        }}
      >
        <Cross2Icon />
      </IconButton>
    </StyledPairInputField>
  );
};

type PairInputFieldProps = {
  id: string;
  value: string;
  disableEditId?: boolean;
  disableEditValue?: boolean;
  onRemove?: () => void;
  onChange?: (id: string, value: string) => void;
};

const PairInputField = ({
  id,
  value,
  disableEditId,
  disableEditValue,
  onRemove,
  onChange,
}: PairInputFieldProps) => {
  const [newId, setNewId] = React.useState(id);
  const [newValue, setNewValue] = React.useState(value);

  const commit = () => {
    if (!newId || !newValue || !onChange) {
      return;
    }

    onChange(newId, newValue);
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
      <TextField
        value={newValue}
        onChange={(e) => {
          if (disableEditValue) {
            return;
          }

          setNewValue(e.target.value);
        }}
        onKeyUp={(e) => {
          if (e.key !== 'Enter') {
            return;
          }

          commit();
        }}
        disabled={disableEditValue}
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
            key={id}
            id={id}
            value={value}
            onRemove={() => {
              props.onRemove?.(id, value);
            }}
            onChange={(id, value) => {
              props.onChange?.(id, value);
            }}
          />
        );
      })}
      {props.addingNewField && (
        <AddNewPairInputField
          onAdd={(id, value, clear) => {
            props.onAdd?.(id, value, clear);
          }}
          onCancel={() => {
            props.onCancelAdding?.();
          }}
        />
      )}
    </StyledPairInputList>
  );
};
