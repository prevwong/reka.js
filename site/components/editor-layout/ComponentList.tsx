import {
  ComponentBooleanIcon,
  ComponentPlaceholderIcon,
} from '@radix-ui/react-icons';
import * as t from '@rekajs/types';
import { pascalCase } from 'pascal-case';
import * as React from 'react';

import { Button } from '@app/components/button';
import { Modal } from '@app/components/modal';
import { Text } from '@app/components/text';
import { TextField } from '@app/components/text-field';
import { useEditor } from '@app/editor';

import { SettingSection } from '../settings-section';

type AddComponentModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const AddComponentModal = (props: AddComponentModalProps) => {
  const [componentName, setComponentName] = React.useState('');
  const editor = useEditor();

  return (
    <Modal
      title="Create new Component"
      isOpen={props.isOpen}
      onClose={() => props.onClose()}
    >
      <div className="flex flex-col mt-5 gap-10">
        <div className="grid grid-cols-pair-input items-center w-full">
          <span className="text-xs">Name</span>

          <TextField
            placeholder="MyComponent"
            value={componentName}
            onChange={(e) => {
              setComponentName(e.target.value);
            }}
          />
        </div>
        <Button
          size="xs"
          onClick={() => {
            const safeComponentName = pascalCase(componentName);

            const existingComponent = editor.reka.components.program.find(
              (component) => component.name === safeComponentName
            );

            if (existingComponent) {
              return;
            }

            editor.reka.change(() => {
              editor.reka.state.program.components.push(
                t.rekaComponent({
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
                          value: t.literal({
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
      </div>
    </Modal>
  );
};

type ComponentListProps = {
  onComponentSelected: (component: t.Component) => void;
};

export const ComponentList = (props: ComponentListProps) => {
  const [showAddComponentModal, setShowAddCompnonentModal] =
    React.useState(false);

  const editor = useEditor();

  const components = editor.reka.state.program.components;

  return (
    <React.Fragment>
      <SettingSection
        collapsedOnInitial={false}
        title="Components"
        onAdd={() => {
          setShowAddCompnonentModal(true);
        }}
      >
        <div className="-ml-4 -mr-4">
          {components.map((component) => (
            <div
              onClick={() => {
                props.onComponentSelected(component);
              }}
              key={component.id}
              className="px-4 py-2.5 group cursor-pointer flex items-center hover:bg-secondary/20 [&>svg]:w-3.5 [&>svg]:h-3.5 [&>svg]:mr-3 [&>button]:opacity-0"
            >
              {component instanceof t.RekaComponent ? (
                <ComponentBooleanIcon />
              ) : (
                <ComponentPlaceholderIcon />
              )}
              <Text size="2" css={{ flex: 1, color: 'rgba(0,0,0,0.8)' }}>
                {component.name}
              </Text>
            </div>
          ))}
        </div>
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
