import { Parser } from '@composite/parser';
import * as t from '@composite/types';
import * as React from 'react';

import { Box } from '@app/components/box';
import { Button } from '@app/components/button';
import { Modal } from '@app/components/modal';
import { PairInput } from '@app/components/pair-input';
import { Select } from '@app/components/select';
import { Text } from '@app/components/text';
import { TextField } from '@app/components/text-field';
import { ToggleGroup, ToggleGroupItem } from '@app/components/toggle-group';
import { useEditor } from '@app/editor';
import { styled } from '@app/styles';

type AddTemplateModalProps = {
  isOpen?: boolean;
  onClose?: () => void;
  onAdd?: (template: t.Template) => void;
};

const InputItem = styled(Box, {
  display: 'grid',
  alignItems: 'center',
  gridTemplateColumns: '80px 1fr',
  width: '100%',
});

export const AddTemplateModal = (props: AddTemplateModalProps) => {
  const [templateType, setTemplateType] = React.useState<
    'tag' | 'component' | 'slot'
  >('tag');
  const [templateTag, setTemplateTag] = React.useState('');
  const [templateComponentName, setTemplateComponentName] = React.useState('');

  const [templateProps, setTemplateProps] = React.useState<Record<string, any>>(
    {}
  );

  const editor = useEditor();

  return (
    <Modal title="Add template" isOpen={props.isOpen} onClose={props.onClose}>
      <Box
        css={{
          display: 'flex',
          mt: '$5',
          flexDirection: 'column',
          gap: '20px',
        }}
      >
        <InputItem>
          <Text size="1">Type</Text>
          <Box>
            <ToggleGroup
              type="single"
              value={templateType}
              onValueChange={(value) => {
                setTemplateType(value as any);
              }}
            >
              <ToggleGroupItem value="tag">Tag</ToggleGroupItem>
              <ToggleGroupItem value="component">Component</ToggleGroupItem>
              <ToggleGroupItem value="slot">Slot</ToggleGroupItem>
            </ToggleGroup>
          </Box>
        </InputItem>
        {templateType === 'tag' && (
          <React.Fragment>
            <InputItem>
              <Text size="1">Tag</Text>
              <TextField
                placeholder="div"
                onChange={(e) => {
                  setTemplateTag(e.target.value);
                }}
              />
            </InputItem>
          </React.Fragment>
        )}
        {templateType === 'component' && (
          <InputItem>
            <Text size="1">Component</Text>
            <Box>
              <Select
                value={templateComponentName}
                onChange={(value) => {
                  setTemplateComponentName(value);
                }}
                items={editor.state.allComponents.map((component) => ({
                  value: component.name,
                  title: component.name,
                }))}
              />
            </Box>
          </InputItem>
        )}
        {(templateType === 'tag' || templateType === 'component') && (
          <InputItem css={{ alignItems: 'flex-start' }}>
            <Text size="1" css={{ mt: '$3' }}>
              Props
            </Text>
            <Box>
              <PairInput
                addingNewField={true}
                onChange={(id, value) => {
                  setTemplateProps((props) => {
                    return {
                      ...props,
                      [id]: value,
                    };
                  });
                }}
                values={Object.keys(templateProps).reduce((accum, key) => {
                  accum.push({
                    id: key,
                    value: templateProps[key],
                  });
                  return accum;
                }, [] as any)}
              />
            </Box>
          </InputItem>
        )}

        <Button
          variant="primary"
          css={{
            mt: '$3',
            justifyContent: 'center',
            fontSize: '$2',
            padding: '$2 $4',
          }}
          onClick={(e) => {
            e.stopPropagation();

            if (!props.onAdd) {
              return;
            }

            const parsedTemplateProps = Object.keys(templateProps).reduce(
              (accum, prop) => {
                return {
                  ...accum,
                  [prop]: Parser.parseExpressionFromSource(
                    templateProps[prop],
                    t.Expression
                  ),
                };
              },
              {}
            );

            if (templateType === 'tag') {
              if (!templateTag) {
                return;
              }

              props.onAdd(
                t.tagTemplate({
                  tag: templateTag,
                  props: parsedTemplateProps,
                  children: [],
                  each: undefined,
                  if: undefined,
                })
              );

              return;
            }

            if (templateType === 'component') {
              if (
                !templateComponentName ||
                !editor.state.allComponents.find(
                  (component) => component.name === templateComponentName
                )
              ) {
                return;
              }

              props.onAdd(
                t.componentTemplate({
                  component: t.identifier({
                    name: templateComponentName,
                  }),
                  props: templateProps,
                  children: [],
                })
              );

              return;
            }

            props.onAdd(
              t.slotTemplate({
                children: [],
                props: {},
              })
            );
          }}
        >
          Add template
        </Button>
      </Box>
    </Modal>
  );
};
