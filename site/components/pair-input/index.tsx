import { Cross2Icon } from '@radix-ui/react-icons';
import { styled } from '@app/styles';
import * as React from 'react';
import cx from 'classnames';

import { Box } from '../box';
import { IconButton } from '../button';
import { Text } from '../text';
import { TextField } from '../text-field';

export const StyledPairInputField = styled('div', {
  display: 'grid',
  gridTemplateColumns: '80px 1fr auto',
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

type PairInputValue = {
  id: string;
  value: string;
};

type PairInputProps = {
  values: PairInputValue[];
  valuePlaceholder?: string;
  onChange?: (id: string, value: string, type: 'update' | 'new') => void;
  onRemove?: (id: string, value: string) => void;
  onAdd?: (id: string, value: string, clear: () => void) => void;
  onCancelAdding?: () => void;
  addingNewField?: boolean;
  emptyValuesText?: string;
};

type AddNewPairInputFieldProps = {
  onAdd: (id: string, value: string, clear: () => void) => void;
  onCancel: () => void;
};

const AddNewPairInputField = (props: AddNewPairInputFieldProps) => {
  const [hasError, setHasError] = React.useState('');
  const [id, setId] = React.useState('');
  const [value, setValue] = React.useState('');

  const idDomRef = React.useRef<HTMLInputElement | null>(null);
  const valueDomRef = React.useRef<HTMLInputElement | null>(null);

  const commit = () => {
    if (!id || !value) {
      return;
    }

    try {
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
    } catch (err) {
      setHasError(String(err));
    }
  };

  return (
    <StyledPairInputField
      className={cx({
        error: !!hasError,
      })}
    >
      <TextField
        ref={(dom) => {
          idDomRef.current = dom;
        }}
        value={id}
        onChange={(e) => {
          setHasError('');
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
          setHasError('');
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

      {hasError && (
        <Box
          css={{
            position: 'absolute',
            left: 'calc(0% - 1px)',
            top: 'calc(100% - 2px)',
            width: 'calc(100% + 2px)',
            padding: '$2 $4',
            backgroundColor: '$red8',
            color: 'white',
            zIndex: '$2',
          }}
        >
          <Text size={1}>{hasError}</Text>
        </Box>
      )}
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
  valuePlaceholder?: string;
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
  const [hasError, setHasError] = React.useState('');
  const [newId, setNewId] = React.useState(id);
  const [newValue, setNewValue] = React.useState(value);

  const commit = () => {
    if (!newId || !newValue || !onChange) {
      return;
    }

    try {
      onChange(newId, newValue);
    } catch (err) {
      setHasError(String(err));
    }
  };

  return (
    <StyledPairInputField
      className={cx({
        error: !!hasError,
      })}
    >
      <TextField
        value={newId}
        onChange={(e) => {
          setHasError('');

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
          setHasError('');

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
        onBlur={() => {
          commit();
        }}
        disabled={disableEditValue}
        placeholder={valuePlaceholder}
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
      {hasError && (
        <Box
          css={{
            position: 'absolute',
            left: 'calc(0% - 1px)',
            top: 'calc(100% - 2px)',
            width: 'calc(100% + 2px)',
            padding: '$2 $4',
            backgroundColor: '$red8',
            color: 'white',
            zIndex: '$2',
          }}
        >
          <Text size={1}>{hasError}</Text>
        </Box>
      )}
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
          onAdd={(id, value, clear) => {
            props.onChange?.(id, value, 'new');
            clear();
          }}
          onCancel={() => {
            props.onCancelAdding?.();
          }}
        />
      )}
    </StyledPairInputList>
  );
};
