import { Parser } from '@rekajs/parser';
import * as t from '@rekajs/types';
import { observer } from 'mobx-react-lite';
import * as React from 'react';

import { Box } from '@app/components/box';
import { Button } from '@app/components/button';
import { ExpressionInput } from '@app/components/expression-input';
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
    const [condition, setCondition] = React.useState<string>(
      props.template.if ? Parser.stringify(props.template.if) : ''
    );

    return (
      <SettingSection
        title={'Conditional'}
        info={'Render this template conditionally'}
        collapsedOnInitial={false}
      >
        <Box>
          <ExpressionInput
            value={condition}
            placeholder="counter > 0"
            onChange={(value) => setCondition(value)}
            onCommit={() => {
              const parsedValue = Parser.parseExpression(
                condition || '',
                t.Expression
              );

              if (!parsedValue) {
                return;
              }

              editor.reka.change(() => {
                props.template.if = parsedValue;
              });
            }}
            onCancel={() => {
              editor.reka.change(() => {
                props.template.if = null;
              });

              setCondition('');
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

  const [iterator, setIteratorValue] = React.useState<t.Expression | null>(
    () => props.template.each?.iterator ?? null
  );
  const [alias, setAliasValue] = React.useState(
    () => props.template.each?.alias.name ?? ''
  );

  const [index, setIndexValue] = React.useState(
    () => props.template.each?.index?.name ?? ''
  );

  const resetValue = React.useCallback(() => {
    setIteratorValue(null);
    setAliasValue('');
    setIndexValue('');
  }, [setIteratorValue, setAliasValue, setIndexValue]);

  const commitValue = (
    iterator: t.Expression | null,
    alias: string,
    index: string
  ) => {
    editor.reka.change(() => {
      if (!iterator) {
        props.template.each = null;
        return;
      }

      props.template.each = t.elementEach({
        iterator,
        alias: t.identifier({
          name: alias,
        }),
        index: index ? t.identifier({ name: index }) : null,
      });
    });
  };

  return (
    <SettingSection
      title="Loop"
      info={'Render this template for each item in an array/list'}
      collapsedOnInitial={false}
    >
      <Box css={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <TextField
          css={{ flex: 1 }}
          placeholder="array"
          value={iterator ? Parser.stringify(iterator) : ''}
          onCancel={() => {
            resetValue();

            editor.reka.change(() => {
              props.template.each = null;
            });
          }}
          onCommit={(value) => {
            const expr = Parser.parseExpression(value, t.Expression);
            setIteratorValue(expr);
            commitValue(expr, alias, index);
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
              commitValue(iterator, expr.name, index);
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

                  editor.reka.change(() => {
                    if (!props.template.each) {
                      return;
                    }

                    props.template.each.index = null;
                  });
                }}
                onCommit={(value) => {
                  const expr = Parser.parseExpression(value, t.Identifier);
                  setIndexValue(expr.name);
                  commitValue(iterator, alias, expr.name);
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
