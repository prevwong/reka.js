import * as t from '@rekajs/types';
import { observer } from 'mobx-react-lite';
import * as React from 'react';

import { ExpressionInput } from '@app/components/expression-input';
import { SettingSection } from '@app/components/settings-section';
import { useEditor } from '@app/editor';

type ConditionalTemplateSettingsProps = {
  template: t.Template;
};

export const ConditionalTemplateSettings = observer(
  (props: ConditionalTemplateSettingsProps) => {
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
            variables={editor.reka.head.resolver.getVariablesAtNode(
              props.template,
              {
                filter: ({ variable }) => !t.is(variable, t.Component),
              }
            )}
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
