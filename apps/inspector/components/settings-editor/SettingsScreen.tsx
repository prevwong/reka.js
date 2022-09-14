import { useEditor } from '@app/editor';
import { AnimatePresence, motion } from 'framer-motion';
import { observer } from 'mobx-react-lite';
import * as React from 'react';
import { Box } from '../box';
import { Button } from '../button';

type SettingsScreenProps = {
  includeParent?: boolean;
  route?: string;
  children?: React.ReactNode;
  hideBackButton?: boolean;
  goBackText?: string;
  goBackToPageNumber?: number;
};

export const SettingsScreen = observer((props: SettingsScreenProps) => {
  const editor = useEditor();
  const [direction, setDirection] = React.useState('right');

  const shouldShowScreen = () => {
    if (props.includeParent) {
      return props.route
        ? editor.settings.paths.find((path) => path.type === props.route)
        : true;
    }

    if (!props.route) {
      return !editor.settings.current;
    }

    return editor.settings.current?.type === props.route;
  };

  return (
    <AnimatePresence initial={false}>
      {shouldShowScreen() && (
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
          {editor.settings.paths.length > 0 && props.hideBackButton !== true && (
            <Box css={{ py: '$4', px: '$4' }}>
              <Button
                css={{ ml: '-$3' }}
                transparent
                variant={'primary'}
                onClick={() => {
                  editor.settings.goBack(props.goBackToPageNumber);
                }}
              >
                {props.goBackText ?? 'Go back'}
              </Button>
            </Box>
          )}
          {props.children}
        </motion.div>
      )}
    </AnimatePresence>
  );
});
