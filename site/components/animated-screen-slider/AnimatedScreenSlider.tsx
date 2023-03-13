import { AnimatePresence, motion } from 'framer-motion';
import * as React from 'react';

import { CREATE_BEZIER_TRANSITION } from '@app/utils';

import { Box } from '../box';
import { Button } from '../button';

type Callbacks = {
  goTo: (id: string) => void;
  goBack: () => void;
};

type Screen = {
  id: string;
  hideBackButton?: boolean;
  render: (cb: Callbacks) => React.ReactNode;
};

type AnimatedScreenSliderProps = {
  screens: Screen[];
  active?: string;
  onSetup?: (getPath: () => string, goTo: (id: string) => void) => void;
  goBackText?: string;
};

export const AnimatedScreenSlider = (props: AnimatedScreenSliderProps) => {
  const [paths, setPaths] = React.useState(props.active ? [props.active] : []);

  const pathsRef = React.useRef(paths);
  pathsRef.current = paths;

  const prevPathsRef = React.useRef<string[] | null>(null);
  const currentPath = React.useMemo(() => paths[paths.length - 1], [paths]);

  const callbacks = {
    goBack: () => {
      if (paths.length <= 1) {
        return;
      }

      prevPathsRef.current = [...paths];

      setPaths((paths) => {
        return paths.slice(0, paths.length - 1);
      });
    },
    goTo: (id: string) => {
      const screen = props.screens.find((screen) => screen.id === id);

      if (!screen) {
        return;
      }

      if (paths.find((path) => path === id)) {
        return;
      }

      prevPathsRef.current = [...paths];

      setPaths((paths) => {
        return [...paths, id];
      });
    },
  };

  React.useEffect(() => {
    if (!props.onSetup) {
      return;
    }

    return props.onSetup(() => {
      return pathsRef.current[pathsRef.current.length - 1];
    }, callbacks.goTo);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.onSetup]);

  return (
    <React.Fragment>
      {props.screens.map((screen, i) => {
        return (
          <AnimatePresence initial={false} key={i}>
            {currentPath === screen.id && (
              <motion.div
                key="route"
                initial="enter"
                animate="show"
                exit="exit"
                variants={{
                  enter: () => {
                    let left = '100%';

                    if (
                      prevPathsRef.current &&
                      prevPathsRef.current.length > i
                    ) {
                      left = '-100%';
                    }

                    return {
                      left,
                      opacity: 0,
                    };
                  },
                  show: { opacity: 1, left: 0 },
                  exit: () => {
                    let left = '100%';

                    if (pathsRef.current.length > i) {
                      left = '-100%';
                    }

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
                transition={CREATE_BEZIER_TRANSITION()}
              >
                {paths.length > 0 && i > 0 && screen.hideBackButton !== true && (
                  <Box css={{ py: '$4', px: '$4' }}>
                    <Button
                      variant="link"
                      onClick={() => {
                        callbacks.goBack();
                      }}
                    >
                      {props.goBackText ?? 'Go Back'}
                    </Button>
                  </Box>
                )}

                {screen.render(callbacks)}
              </motion.div>
            )}
          </AnimatePresence>
        );
      })}
    </React.Fragment>
  );
};
