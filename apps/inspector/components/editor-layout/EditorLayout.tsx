import * as React from 'react';
import { styled } from '@app/styles';
import { useEditor } from '@app/editor';
import { UserFrameExtension } from '@app/extensions/UserFrameExtension';
import { DebugFrame } from '../frame';
import { SettingsEditor } from '../settings-editor';

const StyledScreen = styled('div', {
  display: 'flex',
  flexDirection: 'row',
  height: '100vh',
  overflow: 'hidden',
  background: '$grayA4',
});

const StyledFramesContainer = styled('div', {
  display: 'flex',
  flex: 1,
});

const StyledFramesGrid = styled('div', {
  display: 'grid',
  gap: '1px',
  '--grid-layout-gap': '1px',
  '--grid-column-count': '2',
  '--gap-count': 'calc(var(--grid-column-count) - 1)',
  '--total-gap-width': 'calc(var(--gap-count) * var(--grid-layout-gap))',
  '--grid-item--min-width': '200px',
  '--grid-item--max-width':
    'calc((100% - var(--total-gap-width)) / var(--grid-column-count))',
  'grid-template-columns':
    'repeat(auto-fill, minmax(max(var(--grid-item--min-width), var(--grid-item--max-width)), 1fr))',
  width: '100%',
  overflow: 'scroll',
  [`& ${DebugFrame}`]: {
    minHeight: '50vh',
  },
});

const StyledSidebarContainer = styled('div', {
  width: '300px',
  background: '#fff',
  borderLeft: '1px solid $grayA5',
});

export const EditorLayout = (
  props: React.ComponentProps<typeof StyledScreen>
) => {
  const { state } = useEditor();

  return (
    <StyledScreen {...props}>
      <StyledFramesContainer>
        <StyledFramesGrid>
          {state
            .getExtensionState(UserFrameExtension)
            .frames.map((frame, i) => (
              <DebugFrame key={i} frame={frame} />
            ))}
        </StyledFramesGrid>
      </StyledFramesContainer>
      <StyledSidebarContainer>
        <SettingsEditor />
      </StyledSidebarContainer>
    </StyledScreen>
  );
};
