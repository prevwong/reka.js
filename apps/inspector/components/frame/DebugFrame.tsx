import * as Tabs from '@radix-ui/react-tabs';
import * as React from 'react';
import cx from 'classnames';

import { observer } from 'mobx-react-lite';

import * as t from '@composite/types';
import { Frame } from '@composite/state';

import { Switch } from '@app/components/switch';
import { Tree } from '@app/components/tree';

import { styled } from '@app/styles';
import { Box } from '@app/components/box';
import { Text } from '@app/components/text';
import { useEditor } from '@app/editor';
import { RenderFrame } from './RenderFrame';
import { UserFrame } from '@app/extensions/UserFrameExtension';

type DebugFrameProps = {
  className?: string;
  frame: UserFrame;
};

const TabRoot = styled(Tabs.Root, {
  background: '$whiteA12',
});

const TabList = styled(Tabs.List, {
  display: 'flex',
  alignItems: 'center',
  width: '100%',
  px: '$2',
  py: '$1',
  background: '$whiteA12',
  borderBottom: '1px solid $grayA4',
});

const TabTrigger = styled(Tabs.Trigger, {
  background: 'transparent',
  padding: '$1 $2',
  borderRadius: '$1',
  color: '$blackA12',
  fontSize: '$1',

  '&[data-state="active"]': {
    background: '$blackA12',
    color: '$whiteA12',
  },
});

const TabContent = styled(Tabs.Content, {
  px: '$3',
  py: '$4',
});

export const DebugFrame = observer((props: DebugFrameProps) => {
  const [frame, setFrame] = React.useState<Frame | null>(null);
  const editor = useEditor();

  React.useEffect(() => {
    let frame = editor.state.getFrameById(props.frame.id);

    if (!frame) {
      frame = editor.state.createFrame({
        id: props.frame.id,
        component: {
          name: props.frame.name,
          props: props.frame.props,
        },
      });
    }

    setFrame(frame);
  }, [props.frame]);

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
          root={frame.root}
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
