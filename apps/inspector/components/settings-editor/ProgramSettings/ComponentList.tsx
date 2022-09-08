import * as t from '@composite/types';

import { Box } from '@app/components/box';
import { Button, IconButton } from '@app/components/button';
import { Text } from '@app/components/text';
import { useEditor } from '@app/editor';
import {
  Component1Icon,
  ComponentBooleanIcon,
  ComponentPlaceholderIcon,
} from '@radix-ui/react-icons';
import { observer } from 'mobx-react-lite';
import * as React from 'react';
import { SettingSection } from '../SettingSection';
import { Tooltip } from '@app/components/tooltip';

export const ComponentList = observer(() => {
  const editor = useEditor();

  return (
    <SettingSection
      collapsedOnInitial={false}
      title="Components"
      onAdd={() => {
        // TODO: add UI to create a new component
      }}
    >
      <Box
        css={{
          ml: '-$4',
          mr: '-$4',
        }}
      >
        {editor.state.allComponents.map((component) => (
          <Box
            css={{
              py: '$2',
              px: '$4',

              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              svg: {
                width: '12px',
                height: '12px',
                mr: '$3',
              },
              [`& ${Button}`]: {
                opacity: 0,
              },
              '&:hover': {
                backgroundColor: '$primaryLight',
                [`& ${Button}`]: {
                  opacity: 1,
                },
              },
            }}
          >
            {component instanceof t.CompositeComponent ? (
              <ComponentBooleanIcon />
            ) : (
              <ComponentPlaceholderIcon />
            )}
            <Text size="2" css={{ flex: 1, color: 'rgba(0,0,0,0.8)' }}>
              {component.name}
            </Text>
            <Tooltip
              content={
                component instanceof t.CompositeComponent
                  ? ''
                  : 'This is an external component, we cannot edit it'
              }
            >
              <Box>
                <Button
                  disabled={component instanceof t.CompositeComponent !== true}
                  onClick={() => {
                    editor.settings.goTo({
                      type: 'component',
                      component,
                    });
                  }}
                  css={{
                    cursor:
                      component instanceof t.CompositeComponent
                        ? 'auto'
                        : 'not-allowed',
                  }}
                >
                  Edit Component
                </Button>
              </Box>
            </Tooltip>
          </Box>
        ))}
      </Box>
    </SettingSection>
  );
});
