import { useCollector } from '@composite/react';
import * as t from '@composite/types';
import {
  ComponentBooleanIcon,
  ComponentPlaceholderIcon,
} from '@radix-ui/react-icons';
import { pascalCase } from 'pascal-case';
import * as React from 'react';

import { Box } from '@app/components/box';
import { Button } from '@app/components/button';
import { Modal } from '@app/components/modal';
import { Text } from '@app/components/text';
import { TextField } from '@app/components/text-field';
import { Tooltip } from '@app/components/tooltip';
import { useEditor } from '@app/editor';
import { styled } from '@app/styles';

import { SettingSection } from '../settings-section';

type AddComponentModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const InputItem = styled(Box, {
  display: 'grid',
  alignItems: 'center',
  gridTemplateColumns: '80px 1fr',
  width: '100%',
});

const AddComponentModal = (props: AddComponentModalProps) => {
  const [componentName, setComponentName] = React.useState('');
  const editor = useEditor();

  return (
    <Modal
      title="Create new Component"
      isOpen={props.isOpen}
      onClose={() => props.onClose()}
    >
      <Box
        css={{
          display: 'flex',
          mt: '$5',
          flexDirection: 'column',
          gap: '20px',
        }}
      >
        <InputItem>
          <Text size="1">Name</Text>
          <TextField
            placeholder="MyComponent"
            value={componentName}
            onChange={(e) => {
              setComponentName(e.target.value);
            }}
          />
        </InputItem>
        <Button
          variant="primary"
          css={{
            mt: '$3',
            justifyContent: 'center',
            fontSize: '$2',
            padding: '$2 $4',
          }}
          onClick={() => {
            const safeComponentName = pascalCase(componentName);

            const existingComponent = editor.composite.allComponents.find(
              (component) => component.name === safeComponentName
            );

            if (existingComponent) {
              return;
            }

            editor.composite.change(() => {
              editor.composite.state.program.components.push(
                t.compositeComponent({
                  name: safeComponentName,
                  state: [],
                  props: [],
                  template: t.tagTemplate({
                    tag: 'div',
                    props: {},
                    children: [
                      t.tagTemplate({
                        tag: 'text',
                        props: {
                          text: t.literal({
                            value: safeComponentName,
                          }),
                        },
                        children: [],
                      }),
                    ],
                  }),
                })
              );
            });

            props.onClose();
          }}
        >
          Create Component
        </Button>
      </Box>
    </Modal>
  );
};

type ComponentListProps = {
  onComponentSelected: (component: t.Component) => void;
};

export const ComponentList = (props: ComponentListProps) => {
  const [showAddComponentModal, setShowAddCompnonentModal] =
    React.useState(false);

  const { components } = useCollector((composite) => ({
    components: composite.state.program.components,
  }));

  return (
    <React.Fragment>
      <SettingSection
        collapsedOnInitial={false}
        title="Components"
        onAdd={() => {
          setShowAddCompnonentModal(true);
        }}
      >
        <Box
          css={{
            ml: '-$4',
            mr: '-$4',
          }}
        >
          {components.map((component) => (
            <Box
              key={component.id}
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
                  backgroundColor: '$secondary2',
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
                    disabled={
                      component instanceof t.CompositeComponent !== true
                    }
                    onClick={() => {
                      props.onComponentSelected(component);
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
      <AddComponentModal
        isOpen={showAddComponentModal}
        onClose={() => {
          setShowAddCompnonentModal(false);
        }}
      />
    </React.Fragment>
  );
};
