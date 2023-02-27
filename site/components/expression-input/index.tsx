import { Parser } from '@rekajs/parser';
import * as t from '@rekajs/types';
import { observer } from 'mobx-react-lite';
import * as React from 'react';
import TextareaAutosize from 'react-textarea-autosize';

import { styled } from '@app/styles';

import { Box } from '../box';
import { Info } from '../info';
import { Text } from '../text';
import { TextField } from '../text-field';

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

type TextareaEditorProps = {
  initialValue?: t.Expression | null;
  onClose: () => void;
  onCommit: (value: t.Expression) => void;
};

const TextareaEditor = ({
  onClose,
  onCommit,
  initialValue,
  ...props
}: TextareaEditorProps) => {
  const prevInitialValueRef = React.useRef(initialValue);

  const [value, setValue] = React.useState(
    initialValue ? Parser.stringify(initialValue) : ''
  );
  const [hasError, setHasError] = React.useState('');
  const domRef = React.useRef<HTMLTextAreaElement | null>(null);

  const valueRef = React.useRef(value);
  valueRef.current = value;

  const onCommitRef = React.useRef(onCommit);
  onCommitRef.current = onCommit;

  const onCloseRef = React.useRef(onClose);
  onCloseRef.current = onClose;

  React.useEffect(() => {
    const { current: prevInitialValue } = prevInitialValueRef;

    if (prevInitialValue === initialValue) {
      return;
    }

    prevInitialValueRef.current = initialValue;
    setValue(initialValue ? Parser.stringify(initialValue) : '');
  }, [setValue, initialValue]);

  const commit = React.useCallback(() => {
    const { current: onCommit } = onCommitRef;
    const { current: onClose } = onCloseRef;
    const { current: value } = valueRef;

    if (!value) {
      onClose();

      return;
    }

    try {
      onCommit(Parser.parseExpression(value));
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
          setValue(e.target.value);
          setHasError('');
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            commit();
          }
        }}
      />
      <Box css={{ px: '$3', py: '$2', display: 'flex' }}>
        <Box
          css={{
            fontSize: '0.55rem',
            lineHeight: '1.1rem',
            py: '$1',
            px: '$3',
            border: '1px solid',
            borderColor: '$purple6',
            color: '$purple9',
            display: 'flex',
            borderRadius: '100px',
            alignItems: 'center',
            justifyContent: 'center',
            alignSelf: 'flex-start',
          }}
        >
          Expression
          <Info
            info={`An expression is expected here. Eg: "Some text value" for text literals.`}
          />
        </Box>
      </Box>
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

type ExpressionInputProps = {
  value: t.Expression | null | undefined;
  placeholder?: string;
  disable?: boolean;
  onCommit?: (value: t.Expression) => void;
  onCancel?: () => void;
};

export const ExpressionInput = observer(
  ({
    value,
    disable,
    placeholder,
    onCommit,
    onCancel,
  }: ExpressionInputProps) => {
    const [showTextareaEditor, setShowTextareaEditor] = React.useState(false);

    return (
      <StyledValueField>
        <TextField
          value={value ? Parser.stringify(value) : ''}
          onChange={() => {
            return;
          }}
          onFocus={() => {
            setShowTextareaEditor(true);
          }}
          onCancel={onCancel}
          disabled={disable}
          placeholder={placeholder}
        />

        {showTextareaEditor && (
          <TextareaEditor
            initialValue={value}
            onCommit={(value) => {
              if (!value || !onCommit) {
                return;
              }

              onCommit(value);
            }}
            onClose={() => {
              setShowTextareaEditor(false);
            }}
          />
        )}
      </StyledValueField>
    );
  }
);
