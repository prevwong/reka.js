import { Parser } from '@composite/parser';
import * as t from '@composite/types';
import { observer } from 'mobx-react-lite';
import * as React from 'react';

import { Box } from '@app/components/box';
import { Button } from '@app/components/button';
import { SettingSection } from '@app/components/settings-section';
import { Text } from '@app/components/text';
import { TextField } from '@app/components/text-field';
import { useEditor } from '@app/editor';

type SharedTemplateSettingsProps = {
  template: t.Template;
};

const ConditionalTemplateSetting = observer(
  (props: SharedTemplateSettingsProps) => {
    const editor = useEditor();
    const [condition, setCondition] = React.useState<string | null>(
      props.template.if ? Parser.stringify(props.template.if) : null
    );

    const resetCondition = React.useCallback(() => {
      if (!props.template.if) {
        setCondition(null);
        return;
      }

      setCondition(Parser.stringify(props.template.if));
    }, [props.template, setCondition]);

    return (
      <SettingSection title={'Conditional'} collapsedOnInitial={false}>
        <Box>
          <TextField
            placeholder="counter > 0"
            value={condition || ''}
            onCommit={(value) => {
              const parsedValue = Parser.parseExpression(
                value || '',
                t.Expression
              );

              if (!parsedValue) {
                return;
              }

              editor.composite.change(() => {
                props.template.if = parsedValue;
              });
            }}
            onCancel={() => {
              editor.composite.change(() => {
                props.template.if = null;
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

    editor.composite.change(() => {
      props.template.each = t.elementEach({
        iterator: t.identifier({
          name: iterator,
        }),
        alias: t.identifier({
          name: alias,
        }),
        index: index ? t.identifier({ name: index }) : null,
      });
    });
  };

  return (
    <SettingSection title="Loop" collapsedOnInitial={false}>
      <Box css={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <TextField
          css={{ flex: 1 }}
          placeholder="array"
          value={iterator}
          onCancel={() => {
            resetValue();

            editor.composite.change(() => {
              props.template.each = null;
            });
          }}
          onCommit={(value) => {
            const expr = Parser.parseExpression(value, t.Identifier);
            setIteratorValue(expr.name);
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
            onCommit={(value) => {
              const expr = Parser.parseExpression(value, t.Identifier);
              setAliasValue(expr.name);
              commitValue();
            }}
          />
          {isExposingIndex && (
            <React.Fragment>
              <Text css={{ color: '$grayA9', fontSize: '$1' }}>at</Text>
              <TextField
                placeholder="index"
                onCancel={() => {
                  setIsExposingIndex(false);
                  setIndexValue('');

                  if (!props.template.each) {
                    return;
                  }

                  editor.composite.change(() => {
                    if (!props.template.each) {
                      return;
                    }

                    props.template.each.index = null;
                  });
                }}
                onCommit={(value) => {
                  const expr = Parser.parseExpression(value, t.Identifier);
                  setIndexValue(expr.name);
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
    <React.Fragment>
      <EachTemplateSettings template={props.template} />
      <ConditionalTemplateSetting template={props.template} />
    </React.Fragment>
  );
};
