import * as t from '@composite/types';
import { observer } from 'mobx-react-lite';
import * as React from 'react';

import { useEditor } from '@app/editor';
import { styled } from '@app/stitches.config';
import { Box } from '@app/components/box';

import { motion, AnimatePresence } from 'framer-motion';

import { TagTemplateSettings } from './TagTemplateSettings';
import { Toolbar } from './Toolbar';
import { reaction } from 'mobx';
import { ComponentTemplateSettings } from './ComponentTemplateSettings';

const StyledContainer = styled(motion.div, {
  position: 'absolute',
  bottom: 0,
  left: 0,
  width: '100%',
  '> div': {
    background: 'rgb(0 0 0 / 50%)',
    backdropFilter: 'blur(10px)',
    padding: '$4 $4',
    color: '$whiteA12',
    borderTopLeftRadius: '$1',
    borderTopRightRadius: '$1',
  },
});

const StyledTemplateTypeHeading = styled('h3', {
  fontSize: '14px',
  '> span': {
    fontSize: '10px',
    ml: '$1',
    color: 'rgba(255,255,255,0.8)',
  },
});

const Topbar = styled('div', {
  display: 'flex',
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
      <Topbar>
        <StyledTemplateTypeHeading>
          {template.type}
          <span>{template.id}</span>
        </StyledTemplateTypeHeading>
        <Toolbar template={template} />
      </Topbar>
      <Box css={{ mt: '$4' }}>
        {template instanceof t.TagTemplate && (
          <TagTemplateSettings template={template} />
        )}
        {template instanceof t.ComponentTemplate && (
          <ComponentTemplateSettings template={template} />
        )}
      </Box>
    </div>
  );
});

export const ViewEditor = observer(() => {
  const editor = useEditor();
  const [isSettingsVisible, setIsSettingsVisible] = React.useState(false);

  React.useEffect(() => {
    return reaction(
      () => !!editor.activeFrame,
      (bool) => {
        setIsSettingsVisible(bool);
      }
    );
  }, [editor]);

  React.useEffect(() => {
    const onMouseDownCallback = (e: MouseEvent) => {
      if (!e.target) {
        return;
      }

      const el = e.target as HTMLElement;
      const isClickedOutsideFrame = !!el.querySelector(
        '.debug-frame-container'
      );

      if (!isClickedOutsideFrame) {
        return;
      }

      setIsSettingsVisible(false);
    };

    document.addEventListener('mousedown', onMouseDownCallback);
    return () => document.removeEventListener('mousedown', onMouseDownCallback);
  }, []);

  return (
    <AnimatePresence
      onExitComplete={() => {
        editor.setActiveFrame(null);
      }}
    >
      {isSettingsVisible && (
        <StyledContainer
          initial={{ transform: 'translateY(100%)' }}
          animate={{
            transform: ['translateY(100%)', 'translateY(0px)'],
          }}
          exit={{ transform: ['translateY(0px)', 'translateY(100%)'] }}
          transition={{
            ease: [0.19, 1, 0.22, 1],
            duration: 0.4,
          }}
        >
          <div>
            <ViewSettings />
          </div>
        </StyledContainer>
      )}
    </AnimatePresence>
  );
});
