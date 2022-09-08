import { useEditor } from '@app/editor';
import { AnimatePresence, motion } from 'framer-motion';
import { observer } from 'mobx-react-lite';
import * as React from 'react';
import { Box } from '../box';
import { Button } from '../button';
import { ComponentSettings } from './ComponentSettings';

import { ProgramSettings } from './ProgramSettings';
import { TemplateSettings } from './TemplateSettings';

type SettingsScreenProps = {
  route?: string;
  children?: React.ReactNode;
};

const SettingsScreen = observer((props: SettingsScreenProps) => {
  const editor = useEditor();
  const [direction, setDirection] = React.useState('right');

  return (
    <AnimatePresence initial={false}>
      {(editor.settings.current?.type === props.route ||
        (!editor.settings.current && !props.route)) && (
        <motion.div
          key="route"
          initial="enter"
          animate="show"
          exit="exit"
          custom={direction}
          variants={{
            enter: (direction) => {
              return {
                left: direction === 'left' ? '-100%' : '100%',
                opacity: 0,
              };
            },
            show: { opacity: 1, left: 0 },
            exit: () => {
              let left = '100%';
              let newDirection = 'right';

              if (
                !props.route ||
                (editor.settings.paths.length > 1 &&
                  editor.settings.paths[editor.settings.paths.length - 2])
              ) {
                left = '-100%';
                newDirection = 'left';
              }

              setDirection(newDirection);

              return { opacity: 0, left };
            },
          }}
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            top: 0,
            background: '#fff',
          }}
          transition={{
            x: { type: 'spring', stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 },
          }}
        >
          {editor.settings.paths.length > 0 && (
            <Box css={{ py: '$4', px: '$4' }}>
              <Button
                css={{ ml: '-$3' }}
                transparent
                variant={'primary'}
                onClick={() => {
                  editor.settings.goBack();
                }}
              >
                Go back
              </Button>
            </Box>
          )}
          {props.children}
        </motion.div>
      )}
    </AnimatePresence>
  );
});

export const SettingsEditor = observer(() => {
  return (
    <Box
      css={{
        overflow: 'hidden',
        position: 'relative',
        height: '100%',
        width: '100%',
      }}
    >
      <SettingsScreen>
        <ProgramSettings />
      </SettingsScreen>
      <SettingsScreen route="component">
        <ComponentSettings />
      </SettingsScreen>
      <SettingsScreen route="template">
        <TemplateSettings />
      </SettingsScreen>
    </Box>
  );
});
