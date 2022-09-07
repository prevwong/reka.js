import * as t from '@composite/types';
import { observer } from 'mobx-react-lite';
import * as React from 'react';

import { useEditor } from '@app/editor';
import { styled } from '@app/styles';
import { Box } from '@app/components/box';

import { motion, AnimatePresence } from 'framer-motion';

import { TagTemplateSettings } from './TagTemplateSettings';
import { Toolbar } from './Toolbar';
import { reaction } from 'mobx';
import { ComponentTemplateSettings } from './ComponentTemplateSettings';
import { Dropdown } from '../dropdown';
import { Button } from '../button';
import { ArrowDownIcon, ChevronDownIcon } from '@radix-ui/react-icons';
import { TextField } from '../text-field';
import { SharedTemplateSettings } from './SharedTemplateSettings';

const StyledContainer = styled(motion.div, {
  position: 'relative',
  top: 0,
  right: 0,
  width: '100%',
  height: '100%',
  '> div': {
    padding: '$4 $4',
    height: '100%',
  },
});

const StyledTemplateTypeHeading = styled('div', {
  input: {
    padding: '2px 4px',
    marginLeft: '-4px',
    marginRight: '-4px',
    fontSize: '$4',

    '&:hover': {
      background: '$grayA5',
    },
  },
  '> span': {
    fontSize: '10px',
    color: 'rgba(0,0,0,0.8)',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    mt: '2px',
    cursor: 'pointer',
    svg: {
      display: 'inline-block',
      width: '10px',
      height: '10px',
      ml: '$1',
    },
  },
});

const Topbar = styled('div', {
  display: 'flex',
});

type TemplateHeadingProps = {
  template: t.Template;
};

const TemplateHeading = (props: TemplateHeadingProps) => {
  let title: string;

  const editor = useEditor();

  if (props.template instanceof t.ComponentTemplate) {
    title = props.template.component.name;
  } else if (props.template instanceof t.TagTemplate) {
    title = props.template.tag;
  } else if (props.template instanceof t.SlotTemplate) {
    title = 'Slot';
  } else {
    title = 'Template';
  }

  const [newTitleValue, setNewTitleValue] = React.useState(title);

  return (
    <StyledTemplateTypeHeading>
      <TextField
        value={newTitleValue}
        transparent
        onChange={(e) => {
          setNewTitleValue(e.target.value);
        }}
        onKeyUp={(e) => {
          if (e.key === 'Escape') {
            setNewTitleValue(title);
            return;
          }

          if (e.key !== 'Enter') {
            return;
          }

          const template = props.template;

          if (template instanceof t.TagTemplate) {
            editor.state.change(() => {
              template.tag = newTitleValue;
            });
          }
        }}
      />
      <Dropdown>
        <span>
          {props.template.type} <ChevronDownIcon />
        </span>
      </Dropdown>
    </StyledTemplateTypeHeading>
  );
};

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
        <TemplateHeading template={template} />
        {/* <Toolbar template={template} /> */}
      </Topbar>
      <Box>
        <SharedTemplateSettings template={template} />
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
