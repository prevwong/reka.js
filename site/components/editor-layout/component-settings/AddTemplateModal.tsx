import {
  EXTERNAL_IDENTIFIER_PREFIX_SYMBOL,
  getIdentifierFromStr,
} from '@rekajs/parser';
import * as t from '@rekajs/types';
import { capitalize } from 'lodash';
import * as React from 'react';

import { Button } from '@app/components/button';
import { Modal } from '@app/components/modal';
import { PairInput } from '@app/components/pair-input';
import { Select } from '@app/components/select';
import { Text } from '@app/components/text';
import { TextField } from '@app/components/text-field';
import { ToggleGroup, ToggleGroupItem } from '@app/components/toggle-group';
import { useEditor } from '@app/editor';

type AddTemplateModalProps = {
  isOpen?: boolean;
  onClose?: () => void;
  onAdd?: (template: t.Template) => void;
  allowedTplTypes?: Array<'tag' | 'slot' | 'component'>;
};

export const AddTemplateModal = (props: AddTemplateModalProps) => {
  const allowedTplTypes = props.allowedTplTypes || ['tag', 'component', 'slot'];

  const [templateType, setTemplateType] = React.useState<
    'tag' | 'component' | 'slot'
  >(allowedTplTypes[0]);

  const [templateTag, setTemplateTag] = React.useState('');
  const [templateComponentName, setTemplateComponentName] = React.useState('');

  const [templateProps, setTemplateProps] = React.useState<Record<string, any>>(
    {}
  );

  const editor = useEditor();

  return (
    <Modal title="Add template" isOpen={props.isOpen} onClose={props.onClose}>
      <div className="flex flex-col gap-5 mt-5">
        <div className="grid items-center w-full grid-cols-pair-input">
          <Text size="1">Type</Text>
          <div>
            <ToggleGroup
              type="single"
              value={templateType}
              onValueChange={(value) => {
                setTemplateType(value as any);
              }}
            >
              {allowedTplTypes.map((type) => (
                <ToggleGroupItem key={type} value={type}>
                  {capitalize(type)}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
        </div>
        {templateType === 'tag' && (
          <React.Fragment>
            <div className="grid items-center w-full grid-cols-pair-input">
              <Text size="1">Tag</Text>
              <TextField
                placeholder="div"
                onChange={(e) => {
                  setTemplateTag(e.target.value);
                }}
              />
            </div>
          </React.Fragment>
        )}
        {templateType === 'component' && (
          <div className="grid items-center w-full grid-cols-pair-input">
            <Text size="1">Component</Text>
            <div>
              <Select
                value={templateComponentName}
                onChange={(value) => {
                  setTemplateComponentName(value);
                }}
                items={[
                  ...editor.reka.components.externals.map((component) => ({
                    value: `${EXTERNAL_IDENTIFIER_PREFIX_SYMBOL}${component.name}`,
                    title: `$${component.name}`,
                  })),
                  ...editor.reka.components.program.map((component) => ({
                    value: component.name,
                    title: component.name,
                  })),
                ]}
              />
            </div>
          </div>
        )}
        {(templateType === 'tag' || templateType === 'component') && (
          <div className="grid items-start w-full grid-cols-pair-input">
            <Text size="1" css={{ mt: '$3' }}>
              Props
            </Text>
            <div>
              <PairInput
                addingNewField={true}
                onRemove={(id) => {
                  setTemplateProps((props) => {
                    delete props[id];

                    return {
                      ...props,
                    };
                  });
                }}
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
            </div>
          </div>
        )}

        <Button
          variant="primary"
          className="mt-3 justify-center text-sm"
          onClick={(e) => {
            e.stopPropagation();

            if (!props.onAdd) {
              return;
            }

            if (templateType === 'tag') {
              if (!templateTag) {
                return;
              }

              props.onAdd(
                t.tagTemplate({
                  tag: templateTag,
                  props: templateProps,
                  children: [],
                  each: undefined,
                  if: undefined,
                })
              );

              return;
            }

            if (templateType === 'component') {
              if (!templateComponentName) {
                return;
              }

              props.onAdd(
                t.componentTemplate({
                  component: getIdentifierFromStr(templateComponentName),
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
      </div>
    </Modal>
  );
};
