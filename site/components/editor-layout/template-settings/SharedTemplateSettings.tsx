import { Parser } from '@rekajs/parser';
import * as t from '@rekajs/types';
import { observer } from 'mobx-react-lite';
import * as React from 'react';

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

    return (
      <SettingSection
        title={'Conditional'}
        info={'Render this template conditionally'}
        collapsedOnInitial={false}
      >
        <div>
          <ExpressionInput
            value={props.template.if}
            placeholder="counter > 0"
            onCommit={(expression) => {
              editor.reka.change(() => {
                props.template.if = expression;
              });
            }}
            onCancel={() => {
              editor.reka.change(() => {
                props.template.if = null;
              });
            }}
          />
        </div>
      </SettingSection>
    );
  }
);

const generateAliasNameFromIterator = (iterator: t.Expression) => {
  if (iterator instanceof t.ArrayExpression) {
    return `item_${iterator.id}`;
  }

  if (iterator instanceof t.Identifier) {
    return `item_${iterator.name}`;
  }

  if (iterator instanceof t.CallExpression) {
    return `item_${iterator.identifier.name}`;
  }

  return 'item';
};

const EachTemplateSettings = observer((props: SharedTemplateSettingsProps) => {
  const editor = useEditor();

  const [isExposingIndex, setIsExposingIndex] = React.useState(
    props.template.each?.index ?? false
  );

  const [alias, setAliasValue] = React.useState(
    () => props.template.each?.alias.name ?? ''
  );

  const [index, setIndexValue] = React.useState(
    () => props.template.each?.index?.name ?? ''
  );

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

      const aliasName = alias || generateAliasNameFromIterator(iterator);

      if (!alias) {
        setAliasValue(aliasName);
      }

      props.template.each = t.elementEach({
        iterator,
        alias: t.identifier({
          name: aliasName,
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
      <div className="flex gap-2.5 items-center">
        <ExpressionInput
          placeholder="array"
          value={props.template.each?.iterator}
          onCancel={() => {
            editor.reka.change(() => {
              props.template.each = null;
            });

            setAliasValue('');
            setIndexValue('');
          }}
          onCommit={(iterator) => {
            commitValue(iterator, alias, index);
          }}
        />
      </div>
      <div className="mt-4">
        <div className="mb-4 flex items-center">
          <span className="text-xs flex-1 text-gray-500">Expose Variables</span>
          {isExposingIndex === false && (
            <Button
              variant={'link'}
              onClick={() => {
                setIsExposingIndex(true);
              }}
            >
              Add index variable
            </Button>
          )}
        </div>

        <div className="mt-3 flex gap-2.5 items-center">
          <Text css={{ color: '$grayA9', fontSize: '$1' }}>For</Text>
          <TextField
            placeholder="item"
            css={{ flex: 1 }}
            value={alias}
            onCommit={(value) => {
              const expr = Parser.parseExpression(value, t.Identifier);
              setAliasValue(expr.name);
              commitValue(
                props.template.each?.iterator ?? null,
                expr.name,
                index
              );
            }}
          />
          {isExposingIndex && (
            <React.Fragment>
              <Text css={{ color: '$grayA9', fontSize: '$1' }}>at</Text>
              <TextField
                placeholder="index"
                value={index}
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
                  commitValue(
                    props.template.each?.iterator ?? null,
                    alias,
                    expr.name
                  );
                }}
              />
            </React.Fragment>
          )}
        </div>
      </div>
    </SettingSection>
  );
});

export const SharedTemplateSettings = (props: SharedTemplateSettingsProps) => {
  return (
    <React.Fragment>
      <EachTemplateSettings template={props.template} />
      <ConditionalTemplateSetting template={props.template} />
    </React.Fragment>
  );
};
