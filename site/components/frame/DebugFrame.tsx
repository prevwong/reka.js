import { Frame } from '@composite/state';
import * as t from '@composite/types';
import * as Tabs from '@radix-ui/react-tabs';
import cx from 'classnames';
import { observer } from 'mobx-react-lite';
import * as React from 'react';

import { Box } from '@app/components/box';
import { Switch } from '@app/components/switch';
import { Text } from '@app/components/text';
import { Tree } from '@app/components/tree';
import { useEditor } from '@app/editor';
import { UserFrame } from '@app/extensions/UserFrameExtension';
import { styled } from '@app/styles';

import { RenderFrame } from './RenderFrame';

type DebugFrameProps = {
  className?: string;
  frame: UserFrame;
};

const TabRoot = styled(Tabs.Root, {
  background: '$whiteA12',
  display: 'flex',
  flexDirection: 'column',
});

const TabList = styled(Tabs.List, {
  display: 'flex',
  alignItems: 'center',
  width: '100%',
  px: '$4',
  py: '$2',
  background: '$whiteA12',
  borderBottom: '1px solid $grayA4',
});

const TabTrigger = styled(Tabs.Trigger, {
  background: 'transparent',
  padding: '$2 $3',
  borderRadius: '$1',
  color: '$blackA12',
  fontSize: '$1',

  '&[data-state="active"]': {
    background: '$blackA12',
    color: '$whiteA12',
  },
});

const TabContent = styled(Tabs.Content, {
  px: '$4',
  py: '$4',
  flex: 1,
  overflow: 'auto',
});

export const DebugFrame = observer((props: DebugFrameProps) => {
  const [frame, setFrame] = React.useState<Frame | null>(null);
  const editor = useEditor();

  React.useEffect(() => {
    let frame = editor.composite.getFrameById(props.frame.id);

    if (!frame) {
      frame = editor.composite.createFrame({
        id: props.frame.id,
        component: {
          name: props.frame.name,
          props: props.frame.props,
        },
      });
    }

    setFrame(frame);
  }, [props.frame, editor.composite]);

  if (!frame) {
    return null;
  }

  return (
    <TabRoot
      defaultValue="react"
      className={cx('debug-frame', props.className)}
    >
      <TabList>
        <Box css={{ display: 'flex', alignItems: 'center', flex: 1 }}>
          <Text variant="gray" size={1} css={{ mr: '$3' }}>
            {props.frame.id}
          </Text>
          <Switch
            checked={frame.sync}
            onChange={() => {
              if (frame.sync) {
                frame.disableSync();
                return;
              }

              frame.enableSync();
            }}
          />
        </Box>
        <Box>
          <TabTrigger value="tree" css={{ mr: '$1' }}>
            Render Tree
          </TabTrigger>
          <TabTrigger value="react">Preview</TabTrigger>
        </Box>
      </TabList>
      <TabContent value="tree">
        <Tree
          root={frame.view}
          // @ts-ignore
          shouldCollapseOnInitial={(type, key) => {
            if (
              type instanceof t.ComponentView &&
              ['component'].includes(key)
            ) {
              return true;
            }

            if (type instanceof t.View) {
              if (
                // @ts-ignore
                (key === 'props' && Object.keys(type[key]).length === 0) ||
                key === 'template'
              ) {
                return true;
              }
            }

            return false;
          }}
        />
      </TabContent>
      <TabContent value="react">
        <Box
          css={{
            px: '$2',
            py: '$1',
            height: '100%',
            width: '100%',
          }}
          onClick={() => {
            editor.setActiveFrame(frame);
          }}
        >
          <RenderFrame frame={frame} />
        </Box>
      </TabContent>
    </TabRoot>
  );
});

DebugFrame.toString = () => '.debug-frame';
