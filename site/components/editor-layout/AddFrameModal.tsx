import * as t from '@rekajs/types';
import * as React from 'react';

import { useEditor } from '@app/editor';
import { UserFrameExtension } from '@app/extensions/UserFrameExtension';

import { Button } from '../button';
import { Modal } from '../modal';
import { PairInput } from '../pair-input';
import { TextField } from '../text-field';

type AddFrameModalProps = {
  frameId?: string;
  component: t.Component;
  isOpen?: boolean;
  onClose: () => void;
};

const getInitialComponentProps = (
  component: t.Component,
  existingProps: Record<string, any>
) => {
  if (component instanceof t.RekaComponent) {
    const props: Record<string, t.Expression> = component.props.reduce(
      (accum, prop) => {
        return {
          ...accum,
          [prop.name]: existingProps[prop.name]
            ? existingProps[prop.name]
            : prop.init
            ? t.Schema.fromJSON(prop.init, {
                clone: {
                  replaceExistingId: true,
                },
              })
            : t.literal({ value: '' }),
        };
      },
      {}
    );

    if (existingProps['children']) {
      props['children'] = existingProps['children'];
    }

    return props;
  }

  return {};
};

export const AddFrameModal = (props: AddFrameModalProps) => {
  const editor = useEditor();

  const existingFrame = props.frameId
    ? editor.reka
        .getExtension(UserFrameExtension)
        .state.frames.find((frame) => frame.id === props.frameId)
    : null;

  const [frameName, setFrameName] = React.useState(existingFrame?.name ?? '');
  const [componentProps, setComponentProps] = React.useState<
    Record<string, any>
  >(getInitialComponentProps(props.component, existingFrame?.props ?? {}));

  return (
    <Modal
      title={props.frameId ? 'Update Frame' : 'Create Frame'}
      isOpen={props.isOpen}
      onClose={() => props.onClose()}
    >
      <div className="flex flex-col mt-5 gap-5">
        {!props.frameId && (
          <div className="grid w-full items-center grid-cols-pair-input">
            <span className="text-xs">Name</span>
            <TextField
              placeholder="Frame #1"
              value={frameName}
              required
              onChange={(e) => {
                setFrameName(e.target.value);
              }}
            />
          </div>
        )}

        <div className="grid grid-cols-pair-input items-center w-full">
          <span className="text-xs">Props</span>
          <div>
            <PairInput
              addingNewField={true}
              onChange={(id, value) => {
                setComponentProps((props) => {
                  return {
                    ...props,
                    [id]: value,
                  };
                });
              }}
              values={Object.keys(componentProps).reduce((accum, propKey) => {
                return [
                  ...accum,
                  {
                    id: propKey,
                    value: componentProps[propKey]
                      ? componentProps[propKey]
                      : '',
                  },
                ];
              }, [] as any[])}
            />
          </div>
        </div>
        <Button
          variant="primary"
          onClick={() => {
            if (!frameName) {
              return;
            }

            editor.reka.change(() => {
              if (!existingFrame) {
                editor.reka.getExtension(UserFrameExtension).state.frames.push({
                  id: frameName,
                  name: props.component.name,
                  props: componentProps,
                });

                return;
              }

              existingFrame.props = componentProps;
            });

            // clean up the form
            setFrameName('');

            editor.activeComponentEditor?.setActiveFrame(frameName);

            props.onClose();
          }}
        >
          {props.frameId ? 'Update' : 'Create'} Frame
        </Button>
      </div>
    </Modal>
  );
};
