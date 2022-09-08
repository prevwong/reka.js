import { observer } from 'mobx-react-lite';
import * as React from 'react';

import { useEditor } from '@app/editor';
import { styled } from '@app/styles';

import { motion, AnimatePresence } from 'framer-motion';

import { reaction } from 'mobx';
import { TemplateSettings } from './TemplateSettings';
import { GlobalSettings } from './ProgramSettings/GlobalSettings';
import { ProgramSettings } from './ProgramSettings';

const StyledContainer = styled(motion.div, {
  position: 'relative',
  top: 0,
  right: 0,
  width: '100%',
  height: '100%',
});

const ViewSettings = observer(() => {
  const editor = useEditor();

  if (!editor.activeFrame) {
    return null;
  }

  const [template] = editor.getEvent(editor.activeFrame).state.selected;

  if (!template) {
    return null;
  }

  return (
    <div>
      <TemplateSettings template={template} />
    </div>
  );
});

export const ViewEditor = observer(() => {
  return <ProgramSettings />;
});
