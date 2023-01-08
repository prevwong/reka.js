import { Cross2Icon } from '@radix-ui/react-icons';
import * as React from 'react';
import TextareaAutosize from 'react-textarea-autosize';

import { styled } from '@app/styles';

import { Box } from '../box';
import { IconButton } from '../button';
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

const StyledValueField = styled('div', {
  position: 'relative',
  width: '100%',
});

const StyledTextareaContainer = styled('div', {
  position: 'absolute',
  top: '-1px',
  left: '-1px',
  width: 'calc(100% + 1px)',
  zIndex: '$4',
  border: '1px solid transparent',
  borderRadius: '$2',
  overflow: 'hidden',
  boxShadow: '0px 3px 16px 0px rgb(0 0 0 / 16%)',
  background: '#fff',
  variants: {
    error: {
      true: {
        borderColor: '$red8',
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
      },
    },
  },
});

const StyledTextarea = styled(TextareaAutosize, {
  width: '100%',
  fontSize: '$1',
  padding: '$3 $3',
  outline: 'none',
  resize: 'none',
  fontFamily: 'JetBrains Mono',
});

type PairInputFieldProps = {
  id: string;
  value: string;
  disableEditId?: boolean;
  disableEditValue?: boolean;
  onRemove?: () => void;
  onChange?: (id: string, value: string) => void;
  valuePlaceholder?: string;
};

type TextareaEditorProps = React.ComponentProps<typeof StyledTextarea> & {
  onClose: () => void;
  onCommit: () => void;
};

const TextareaEditor = ({
  onClose,
  onCommit,
  value,
  ...props
}: TextareaEditorProps) => {
  const [hasError, setHasError] = React.useState('');
  const domRef = React.useRef<HTMLTextAreaElement | null>(null);

  const onCommitRef = React.useRef(onCommit);
  onCommitRef.current = onCommit;

  const onCloseRef = React.useRef(onClose);
  onCloseRef.current = onClose;

  const commit = React.useCallback(() => {
    const { current: onCommit } = onCommitRef;
    const { current: onClose } = onCloseRef;

    try {
      onCommit();
      onClose();
    } catch (err) {
      setHasError(String(err));
    }
  }, [setHasError]);

  React.useEffect(() => {
    const { current: dom } = domRef;

    if (!dom) {
      return;
    }

    dom.focus();
    dom.setSelectionRange(dom.value.length, dom.value.length);

    const listener = (e: any) => {
      if (dom.contains(e.target as any) === true) {
        return;
      }

      commit();
    };

    const parent = dom.closest('[role="dialog"]') ?? window;

    parent.addEventListener('mousedown', listener);

    return () => {
      parent.removeEventListener('mousedown', listener);
    };
  }, [commit]);

  return (
    <StyledTextareaContainer error={!!hasError}>
      <StyledTextarea
        {...props}
        value={value}
        ref={domRef}
        onChange={(e) => {
          props.onChange?.(e);
          setHasError('');
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            commit();
          }
        }}
      />
      {hasError && (
        <Box
          css={{
            position: 'relative',
            width: '100%',
            padding: '$2 $3',
            backgroundColor: '$red8',
            color: 'white',
            zIndex: '$2',
          }}
        >
          <Text size={1}>{hasError}</Text>
        </Box>
      )}
    </StyledTextareaContainer>
  );
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
  onAdd?: (id: string, value: string, clear: () => void) => void;
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
      onChange={(id, value) => {
        commit(id, value);
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
  const [showTextareaEditor, setShowTextareaEditor] = React.useState(false);

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
      <StyledValueFieldContainer>
        <StyledValueField>
          <TextField
            value={newValue}
            onChange={() => {
              return;
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
            onFocus={() => {
              setShowTextareaEditor(true);
            }}
            disabled={disableEditValue}
            placeholder={valuePlaceholder}
          />

          {showTextareaEditor && (
            <TextareaEditor
              value={newValue}
              onChange={(e) => {
                setNewValue(e.target.value);
              }}
              onCommit={() => {
                commit();
              }}
              onClose={() => {
                setShowTextareaEditor(false);
              }}
            />
          )}
        </StyledValueField>
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
