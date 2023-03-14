import * as t from '@rekajs/types';
import { observer } from 'mobx-react-lite';
import * as React from 'react';

import { Text } from '@app/components/text';
import { useEditor } from '@app/editor';

import { ComponentTemplateSettings } from './ComponentTemplateSettings';
import { SharedTemplateSettings } from './SharedTemplateSettings';
import { TagTemplateSettings } from './TagTemplateSettings';

type TemplateHeadingProps = {
  template: t.Template;
};

const TemplateHeading = (props: TemplateHeadingProps) => {
  let title: string;

  if (props.template instanceof t.ComponentTemplate) {
    title = props.template.component.name;
  } else if (props.template instanceof t.TagTemplate) {
    title = props.template.tag;
  } else if (props.template instanceof t.SlotTemplate) {
    title = 'Slot';
  } else {
    title = 'Template';
  }

  return (
    <div className="flex items-center flex-1">
      <div className="flex-1 text-sm">
        <span className="text-lg color-gray-800 w-full flex items-center mt-1 cursor-pointer">
          {title}
        </span>
      </div>
      <div className="text-xs bg-primary/10 text-primary/90 inline-block w-auto px-4 py-3 rounded-full align-end">
        {props.template.type}
      </div>
    </div>
  );
};

const InternalTemplateSettings = ({ template }: any) => {
  return (
    <div>
      <div className="flex px-4 py-3 mt-4">
        <TemplateHeading template={template} />
      </div>
      <div className="mt-3">
        <SharedTemplateSettings template={template} />
        {template instanceof t.TagTemplate && (
          <TagTemplateSettings template={template} />
        )}
        {template instanceof t.ComponentTemplate && (
          <ComponentTemplateSettings template={template} />
        )}
      </div>
    </div>
  );
};

export const TemplateSettings = observer(() => {
  const editor = useEditor();

  const template = editor.activeComponentEditor?.tplEvent.selected;

  if (!template) {
    return (
      <div className="px-8 py-4 flex flex-col justify-center items-center h-full text-center gap-2">
        <Text size={2} css={{ color: '$slate10', lineHeight: '1.2rem' }}>
          Click on an element on the screen to start editing a template.
        </Text>
      </div>
    );
  }

  return <InternalTemplateSettings key={template.id} template={template} />;
});
