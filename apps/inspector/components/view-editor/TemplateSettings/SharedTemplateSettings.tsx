import * as t from '@composite/types';
import { Parser, Stringifier } from '@composite/parser';

import * as React from 'react';
import { observer } from 'mobx-react-lite';

import { useEditor } from '@app/editor';
import { Box } from '@app/components/box';
import { CancellableInputField, TextField } from '@app/components/text-field';
import { Text } from '@app/components/text';
import { Button } from '@app/components/button';

import { SettingSection } from '../SettingSection';

type SharedTemplateSettingsProps = {
  template: t.Template;
};

const parser = new Parser();
const stringifier = new Stringifier();

const ConditionalTemplateSetting = observer(
  (props: SharedTemplateSettingsProps) => {
    const editor = useEditor();
    const [condition, setCondition] = React.useState<string | null>(
      props.template.if ? stringifier.toString(props.template.if) : null
    );

    const resetCondition = React.useCallback(() => {
      if (!props.template.if) {
        setCondition(null);
        return;
      }

      setCondition(stringifier.toString(props.template.if));
    }, [props.template, setCondition]);

    return (
      <SettingSection title={'Conditional'}>
        <Box>
          <CancellableInputField
            placeholder="counter > 0"
            onChange={(e) => {
              setCondition(e.target.value);
            }}
            value={condition || ''}
            onKeyUp={(e) => {
              if (e.key === 'Escape') {
                resetCondition();
                return;
              }

              if (e.key !== 'Enter') {
                return;
              }

              const parsedValue = parser.parseExpressionFromSource(
                `{${condition}}`
              );

              if (!parsedValue) {
                return;
              }

              editor.state.change(() => {
                props.template.if = parsedValue;
              });
            }}
            onCancel={() => {
              editor.state.change(() => {
                props.template.if = undefined;
              });

              resetCondition();
            }}
          />
        </Box>
      </SettingSection>
    );
  }
);

const EachTemplateSettings = (props: SharedTemplateSettingsProps) => {
  const editor = useEditor();

  const [isExposingIndex, setIsExposingIndex] = React.useState(false);

  const [iterator, setIteratorValue] = React.useState(
    () => props.template.each?.iterator.name ?? ''
  );
  const [alias, setAliasValue] = React.useState(
    () => props.template.each?.alias.name ?? ''
  );

  const [index, setIndexValue] = React.useState(
    () => props.template.each?.index?.name ?? ''
  );

  const resetValue = React.useCallback(() => {
    setIteratorValue(props.template.each?.iterator.name ?? '');
    setAliasValue(props.template.each?.alias.name ?? '');
    setIndexValue(props.template.each?.index?.name ?? '');
  }, [props.template, setIteratorValue, setAliasValue, setIndexValue]);

  const commitValue = () => {
    if (!iterator || !alias) {
      return;
    }

    editor.state.change(() => {
      props.template.each = t.elementEach({
        iterator: t.identifier({
          name: iterator,
        }),
        alias: t.identifier({
          name: alias,
        }),
        ...(index ? { index: t.identifier({ name: index }) } : {}),
      });
    });
  };

  return (
    <SettingSection title="Loop">
      <Box css={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <CancellableInputField
          css={{ flex: 1 }}
          placeholder="array"
          value={iterator}
          onCancel={() => {
            setIteratorValue('');
            setAliasValue('');
            setIndexValue('');

            editor.state.change(() => {
              props.template.each = undefined;
            });
          }}
          onChange={(e) => {
            setIteratorValue(e.target.value);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              resetValue();
              return;
            }

            if (e.key !== 'Enter') {
              return;
            }

            commitValue();
          }}
        />
      </Box>
      <Box css={{ mt: '$4' }}>
        <Box css={{ display: 'flex', alignItems: 'center' }}>
          <Text css={{ flex: 1, fontSize: '$1', color: '$grayA11' }}>
            Expose Variables
          </Text>
          {isExposingIndex === false && (
            <Button
              tiny
              transparent
              variant="primary"
              onClick={() => {
                setIsExposingIndex(true);
              }}
              css={{ my: '-$1' }}
            >
              Add index variable
            </Button>
          )}
        </Box>

        <Box
          css={{ mt: '$3', display: 'flex', gap: '10px', alignItems: 'center' }}
        >
          <Text css={{ color: '$grayA9', fontSize: '$1' }}>For</Text>
          <TextField
            placeholder="item"
            css={{ flex: 1 }}
            value={alias}
            onChange={(e) => {
              setAliasValue(e.target.value);
            }}
            onKeyUp={(e) => {
              if (e.key === 'Escape') {
                resetValue();
                return;
              }

              if (e.key !== 'Enter') {
                return;
              }

              commitValue();
            }}
          />
          {isExposingIndex && (
            <React.Fragment>
              <Text css={{ color: '$grayA9', fontSize: '$1' }}>at</Text>
              <CancellableInputField
                placeholder="index"
                onCancel={() => {
                  setIsExposingIndex(false);
                  setIndexValue('');

                  if (!props.template.each) {
                    return;
                  }

                  editor.state.change(() => {
                    if (!props.template.each) {
                      return;
                    }

                    props.template.each.index = undefined;
                  });
                }}
                onChange={(e) => {
                  setIndexValue(e.target.value);
                }}
                onKeyUp={(e) => {
                  if (e.key === 'Escape') {
                    resetValue();
                    return;
                  }

                  if (e.key !== 'Enter') {
                    return;
                  }

                  commitValue();
                }}
              />
            </React.Fragment>
          )}
        </Box>
      </Box>
    </SettingSection>
  );
};

export const SharedTemplateSettings = (props: SharedTemplateSettingsProps) => {
  return (
    <Box>
      <EachTemplateSettings template={props.template} />
      <ConditionalTemplateSetting template={props.template} />
    </Box>
  );
};
