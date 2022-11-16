import { useEditor } from '@app/editor';
import * as React from 'react';
import { AnimatedScreenSlider } from '../animated-screen-slider/AnimatedScreenSlider';
import { Box } from '../box';
import { ComponentSettings } from './ComponentSettings';
import { ComponentList } from './ProgramSettings/ComponentList';
import { GlobalSettings } from './ProgramSettings/GlobalSettings';

export const LeftSettingsEditor = () => {
  const editor = useEditor();

  return (
    <Box
      css={{
        overflow: 'auto',
        position: 'relative',
        height: '100%',
        width: '250px',
        display: 'flex',
        flexDirection: 'column',
        borderRight: '1px solid $grayA5',
        background: '#fff',
      }}
    >
      <GlobalSettings />

      <Box css={{ position: 'relative', flex: 1 }}>
        <AnimatedScreenSlider
          active={'component-list'}
          screens={[
            {
              id: 'component-list',
              render: (cb) => {
                return (
                  <ComponentList
                    onComponentSelected={(component) => {
                      editor.setActiveComponentEditor(component);
                      cb.goTo('component-editor');
                    }}
                  />
                );
              },
            },
            {
              id: 'component-editor',
              render: () => {
                return <ComponentSettings />;
              },
            },
          ]}
        />
      </Box>
    </Box>
  );
};
