import { Cross2Icon } from '@radix-ui/react-icons';
import * as t from '@rekajs/types';
import * as React from 'react';

import { IconButton } from '../button';
import { ExpressionInput } from '../expression-input';
import { TextField } from '../text-field';
import { Tooltip } from '../tooltip';

type PairInputFieldProps = {
  id: string;
  value: t.Expression | null;
  disableEditId?: boolean;
  disableEditValue?: boolean;
  onRemove?: () => void;
  onChange?: (id: string, value: t.Expression, clear: () => void) => void;
  idPlaceholder?: string;
  valuePlaceholder?: string;
};

type PairInputValue = {
  id: string;
  value: t.Expression | null;
};

type PairInputProps = {
  values: PairInputValue[];
  idPlaceholder?: string;
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
  idPlaceholder?: string;
  valuePlaceholder?: string;
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
      idPlaceholder={props.idPlaceholder}
      valuePlaceholder={props.valuePlaceholder}
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
      idPlaceholder,
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
      <div
        className={`
        group
        grid grid-cols-[80px_1fr] relative gap-0 border-solid border border-outline -mb-px
        first:rounded-tr-md first:rounded-tl-md
        last:rounded-br-md last:rounded-bl-md
        [&:not:last-child]:border-b-transparent
        [&_input]:rounded-none [&_input]:border-none [&_input]:border-r [&_input]:border-r-solid
      `}
        ref={ref}
      >
        <Tooltip content={newId} disabled={!disableEditId}>
          <TextField
            className={`pair-input-id-field rounded-none border-l-0 border-t-0 border-b-0 border-r-solid border-r border-r-outline`}
            inputClassName={'overflow-hidden text-ellipsis'}
            placeholder={idPlaceholder}
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
        </Tooltip>

        <div className="w-full grid grid-cols-[1fr_auto] relative">
          <ExpressionInput
            inputClassName="rounded-none border-none"
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
            className="opacity-0 m-0 group-hover:opacity-100"
            onClick={() => {
              if (!onRemove) {
                return;
              }

              onRemove();
            }}
          >
            <Cross2Icon />
          </IconButton>
        </div>
      </div>
    );
  }
);

export const PairInput = (props: PairInputProps) => {
  return (
    <div>
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
        <div>
          <span className="text-gray-500 text-xs">
            {props.emptyValuesText || 'No values yet'}
          </span>
        </div>
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
          idPlaceholder={props.idPlaceholder}
          valuePlaceholder={props.valuePlaceholder}
        />
      )}
    </div>
  );
};
