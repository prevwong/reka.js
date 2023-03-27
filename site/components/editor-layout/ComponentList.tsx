import {
  ChevronRightIcon,
  ComponentPlaceholderIcon,
  LayersIcon,
} from '@radix-ui/react-icons';
import * as t from '@rekajs/types';
import { pascalCase } from 'pascal-case';
import * as React from 'react';

import { Button } from '@app/components/button';
import { Modal } from '@app/components/modal';
import { TextField } from '@app/components/text-field';
import { useEditor } from '@app/editor';
import { cn } from '@app/utils';

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
      title="Create Component"
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
          variant="primary"
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

  const activeComponent = editor.activeComponentEditor?.component;

  return (
    <React.Fragment>
      <SettingSection
        className="flex-1"
        collapsedOnInitial={false}
        title="Components"
        onAdd={() => {
          setShowAddCompnonentModal(true);
        }}
      >
        <div className="flex h-full flex-col">
          <div className="flex-1">
            {components.map((component) => (
              <div
                onClick={() => {
                  props.onComponentSelected(component);
                }}
                key={component.id}
                className={cn(
                  'group px-3 py-2 my-0.5 rounded-md text-xs leading-1 group cursor-pointer flex items-center [&>svg]:w-3.5 [&>svg]:h-3.5 [&>button]:opacity-0',
                  {
                    'bg-primary/10 text-primary': activeComponent === component,
                    'text-slate-700 hover:bg-black/5 hover:text-slate-900':
                      activeComponent !== component,
                  }
                )}
              >
                {component instanceof t.RekaComponent ? (
                  <LayersIcon className="mr-3.5" />
                ) : (
                  <ComponentPlaceholderIcon className="mr-3.5" />
                )}
                <span className="flex-1">{component.name}</span>
                <ChevronRightIcon className="opacity-0 relative translate-x-5 transition ease-bezier duration-300 group-hover:opacity-100 group-hover:translate-x-0" />
              </div>
            ))}
          </div>
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
