import { useEditor } from '@app/editor';
import * as t from '@composite/types';
import { Stringifier, Parser } from '@composite/parser';
import { UserFrameExtension } from '@app/extensions/UserFrameExtension';
import { styled } from '@app/styles';

import * as React from 'react';
import { Box } from '../box';
import { Button } from '../button';
import { Modal } from '../modal';
import { PairInput } from '../pair-input';
import { Text } from '../text';
import { TextField } from '../text-field';

const stringifier = new Stringifier();
const parser = new Parser();

type AddFrameModalProps = {
  frameId?: string;
  component: t.Component;
  isOpen?: boolean;
  onClose: () => void;
};

const InputItem = styled(Box, {
  display: 'grid',
  alignItems: 'center',
  gridTemplateColumns: '80px 1fr',
  width: '100%',
});

const getInitialComponentProps = (
  component: t.Component,
  existingProps: Record<string, any>
) => {
  if (component instanceof t.CompositeComponent) {
    return component.props.reduce((accum, prop) => {
      return {
        ...accum,
        [prop.name]: existingProps[prop.name] ?? t.literal({ value: '' }),
      };
    }, {});
  }

  return {};
};

export const AddFrameModal = (props: AddFrameModalProps) => {
  const editor = useEditor();

  const existingFrame = props.frameId
    ? editor.state
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
      <Box
        css={{
          display: 'flex',
          mt: '$5',
          flexDirection: 'column',
          gap: '20px',
        }}
      >
        {!props.frameId && (
          <InputItem>
            <Text size="1">Name</Text>
            <TextField
              placeholder="Frame #1"
              value={frameName}
              onChange={(e) => {
                setFrameName(e.target.value);
              }}
            />
          </InputItem>
        )}

        <InputItem>
          <Text size="1">Props</Text>
          <Box>
            <PairInput
              addingNewField={true}
              onChange={(id, value) => {
                try {
                  const parsedValue = parser.parseExpressionFromSource(value);

                  setComponentProps((props) => {
                    return {
                      ...props,
                      [id]: parsedValue,
                    };
                  });
                } catch (err) {
                  // TODO: err
                }
              }}
              onRemove={() => {}}
              values={Object.keys(componentProps).reduce((accum, propKey) => {
                return [
                  ...accum,
                  {
                    id: propKey,
                    value: componentProps[propKey]
                      ? stringifier.toString(componentProps[propKey])
                      : '',
                  },
                ];
              }, [] as any[])}
            />
          </Box>
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
            editor.state.change(() => {
              if (!existingFrame) {
                editor.state
                  .getExtension(UserFrameExtension)
                  .state.frames.push({
                    id: frameName,
                    name: props.component.name,
                    props: componentProps,
                  });

                return;
              }

              existingFrame.props = componentProps;
            });

            editor.activeComponentEditor?.setActiveFrame(frameName);

            props.onClose();
          }}
        >
          {props.frameId ? 'Update' : 'Create'} Frame
        </Button>
      </Box>
    </Modal>
  );
};
