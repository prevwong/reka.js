import * as t from '@composite/types';
import { ArrowDownIcon, ArrowUpIcon, TrashIcon } from '@radix-ui/react-icons';
import * as React from 'react';

import { useEditor } from '@app/editor';
import { styled } from '@app/stitches.config';
import { Button } from '@app/components/button';

const StyledToolbarContainer = styled('div', {
  flex: 1,
  display: 'flex',
  justifyContent: 'flex-end',
  gap: '5px',
  [`& ${Button}`]: {},
});

type ToolbarProps = {
  template: t.Template;
};

export const Toolbar = ({ template }: ToolbarProps) => {
  const editor = useEditor();

  return (
    <StyledToolbarContainer>
      <Button
        variant="dark"
        onClick={() => {
          const parent = editor.state.getParentType(template);

          if (!parent || !Array.isArray(parent.value)) {
            return;
          }

          editor.state.change(() => {
            parent.value.splice(parent.key, 1);
          });
        }}
      >
        <TrashIcon />
      </Button>
      <Button
        variant="dark"
        onClick={() => {
          const parent = editor.state.getParentType(template);
          if (!Array.isArray(parent.value)) {
            return;
          }

          const newIndex = parent.key - 1;

          if (newIndex < 0) {
            return;
          }

          editor.state.change(() => {
            parent.value.splice(parent.key, 1);
            parent.value.splice(newIndex, 0, template);
          });
        }}
      >
        <ArrowUpIcon />
      </Button>
      <Button
        variant="dark"
        onClick={() => {
          const parent = editor.state.getParentType(template);
          if (!Array.isArray(parent.value)) {
            return;
          }
          const newIndex = parent.key + 2;
          editor.state.change(() => {
            parent.value.splice(newIndex, 0, template);
            parent.value.splice(parent.key, 1);
          });
        }}
      >
        <ArrowDownIcon />
      </Button>
    </StyledToolbarContainer>
  );
};
