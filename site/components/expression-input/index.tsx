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
  value: any;
  placeholder?: string;
  disable?: boolean;
  onChange?: (value: string) => void;
  onCommit?: (value: string) => void;
  onCancel?: () => void;
};

export const ExpressionInput = ({
  value,
  disable,
  placeholder,
  onChange,
  onCommit,
  onCancel,
}: ExpressionInputProps) => {
  const [showTextareaEditor, setShowTextareaEditor] = React.useState(false);

  const commit = () => {
    if (!value || !onCommit) {
      return;
    }

    onCommit(value);
  };

  return (
    <StyledValueField>
      <TextField
        value={value}
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
        onCancel={onCancel}
        disabled={disable}
        placeholder={placeholder}
      />

      {showTextareaEditor && (
        <TextareaEditor
          value={value}
          onChange={(e) => {
            if (!onChange) {
              return;
            }

            onChange(e.target.value);
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
  );
};
