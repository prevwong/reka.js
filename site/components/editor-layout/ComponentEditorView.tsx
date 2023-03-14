import {
  DotsHorizontalIcon,
  DoubleArrowRightIcon,
} from '@radix-ui/react-icons';
import classNames from 'classnames';
import { motion } from 'framer-motion';
import { observer } from 'mobx-react-lite';
import * as React from 'react';

import { useEditor, useEditorActiveComponent } from '@app/editor';
import { EditorMode } from '@app/editor/Editor';
import { UserFrameExtension } from '@app/extensions/UserFrameExtension';
import { CREATE_BEZIER_TRANSITION } from '@app/utils';

import { AddFrameModal } from './AddFrameModal';
import { EditPreviewSize } from './EditPreviewSize';

import { Button, IconButton } from '../button';
import { Dropdown } from '../dropdown';
import { RenderFrame } from '../frame/RenderFrame';
import { Info } from '../info';
import { MobileFallback } from '../mobile-fallback';
import { Popover } from '../popover';
import { Select } from '../select';
import { Switch } from '../switch';
import { Tooltip } from '../tooltip';
import { Tree } from '../tree';

const TOOLBAR_HEIGHT = 40;

const BOTTOM_TOOLBAR_HEIGHT = 40;

const NoFrameSelectedMessage = () => {
  return (
    <div className="flex items-center leading-6 justify-center text-center h-full w-full">
      <span className="text-gray-500">
        No frame selected.
        <br />
        Click &quot;Add new Frame&quot; to create one.
      </span>
    </div>
  );
};

export const ComponentEditorView = observer(() => {
  const editor = useEditor();

  const [showViewTree, setShowViewTree] = React.useState(false);
  const [showAddFrameModal, setShowAddFrameModal] = React.useState(false);
  const [isEditingFrame, setIsEditingFrame] = React.useState(false);

  const componentEditor = useEditorActiveComponent();

  const containerDOMRef = React.useRef<HTMLDivElement | null>(null);
  const frameContainerDOMRef = React.useRef<HTMLDivElement | null>(null);

  const frames = componentEditor
    ? editor.reka
        .getExtension(UserFrameExtension)
        .state.frames.filter(
          (frame) => frame.name === componentEditor.component.name
        )
    : [];

  const setEditFrame = React.useCallback(
    (bool = true) => {
      setShowAddFrameModal(bool);
      setIsEditingFrame(bool);
    },
    [setShowAddFrameModal, setIsEditingFrame]
  );

  const removeFrame = React.useCallback(() => {
    editor.reka.change(() => {
      const userFrame = componentEditor.activeFrame?.user;

      if (!userFrame) {
        return;
      }

      const userFrames =
        editor.reka.getExtension(UserFrameExtension).state.frames;

      userFrames.splice(userFrames.indexOf(userFrame), 1);
    });
  }, [editor, componentEditor]);

  if (!componentEditor) {
    return (
      <div className="h-full text-center flex items-center justify-center">
        <span className="text-neutral-900">No component selected</span>
      </div>
    );
  }
  return (
    <div className="relative flex flex-col h-full" ref={containerDOMRef}>
      <motion.div
        className={`flex items-center px-4 py-2.5 border-b border-solid border-outline w-full relative z-40 bg-white h-[${TOOLBAR_HEIGHT}px]`}
        initial={false}
        animate={editor.mode === EditorMode.Preview ? 'exit' : 'enter'}
        variants={{
          enter: {
            marginTop: 0,
            opacity: 1,
          },
          exit: {
            marginTop: `-${TOOLBAR_HEIGHT}px`,
            opacity: 0,
          },
        }}
        transition={CREATE_BEZIER_TRANSITION()}
      >
        <div className="flex flex-1 items-center">
          {(editor.compactSidebar || editor.mode === EditorMode.Code) && (
            <Tooltip content="Toggle sidebar">
              <IconButton
                className="mr-3"
                variant={'outline'}
                onClick={(e) => {
                  e.stopPropagation();

                  editor.showCompactSidebar(!editor.compactSidebarVisible);
                }}
              >
                <DoubleArrowRightIcon
                  style={{
                    transition: '0.2s ease-in',
                    transform: `rotate(${
                      editor.compactSidebarVisible ? 180 : 0
                    }deg)`,
                  }}
                />
              </IconButton>
            </Tooltip>
          )}

          <span className="mr-4">{componentEditor.component.name}</span>
          {frames.length > 0 && (
            <Select
              placeholder="Select a frame"
              value={componentEditor.activeFrame?.state.id}
              onChange={(value) => {
                componentEditor.setActiveFrame(value);
              }}
              items={frames.map((frame) => ({
                value: frame.id,
                title: frame.id,
              }))}
            />
          )}

          <Button
            size="xs"
            className="ml-2"
            variant="subtle"
            onClick={() => {
              setShowAddFrameModal(true);
            }}
          >
            Add Frame
          </Button>
          <Info info="A Frame is an instance of a Reka Component" />
        </div>
        <div className="flex items-center">
          <MobileFallback
            fallback={
              <Popover
                trigger={
                  <IconButton>
                    <DotsHorizontalIcon />
                  </IconButton>
                }
              >
                <div className="flex flex-col gap-3">
                  <EditPreviewSize frames={frames} />
                </div>
              </Popover>
            }
            render={<EditPreviewSize frames={frames} />}
          />
        </div>
      </motion.div>

      <div className="relative flex flex-1 h-full min-h-0">
        {!componentEditor.activeFrame ? (
          <NoFrameSelectedMessage />
        ) : (
          <React.Fragment>
            <div
              className={classNames(
                `w-full h-full overflow-hidden flex items-center bg-outline transition-ease`,
                {
                  'filter-grayscale': componentEditor.activeFrame.state.sync,
                }
              )}
              ref={frameContainerDOMRef}
            >
              <RenderFrame
                width={componentEditor.activeFrame.user.width}
                height={componentEditor.activeFrame.user.height}
                frame={componentEditor.activeFrame}
              />
            </div>

            {componentEditor.activeFrame.state.view && showViewTree && (
              <div className="relative bg-white w-${350px} [&>div]:px-2 [&>div]:py-4 [&>div]:overflow-auto [&>div]:w-full [&>div]:h-full">
                <Tree root={componentEditor.activeFrame.state.view} />
              </div>
            )}
          </React.Fragment>
        )}
      </div>
      {componentEditor.activeFrame && (
        <motion.div
          className={`flex items-center border-t border-solid border-outline px-4 py-1.5 relative z-20 bg-white h-[${BOTTOM_TOOLBAR_HEIGHT}]px`}
          initial={false}
          animate={editor.mode === EditorMode.Preview ? 'exit' : 'enter'}
          variants={{
            exit: {
              marginBottom: `-${BOTTOM_TOOLBAR_HEIGHT}px`,
              opacity: 0,
            },
            enter: {
              marginBottom: 0,
              opacity: 1,
            },
          }}
          transition={CREATE_BEZIER_TRANSITION()}
        >
          <div className="flex items-center flex-1">
            <div className="flex items-center gap-3">
              <Switch
                onChange={() => {
                  if (componentEditor.activeFrame?.state.sync) {
                    componentEditor.activeFrame?.state.disableSync();
                    return;
                  }

                  componentEditor.activeFrame?.state.enableSync();
                }}
                checked={componentEditor.activeFrame.state.sync}
              />

              <span className="text-xs flex text-neutral-600 items-center">
                {componentEditor.activeFrame?.state.sync
                  ? 'Syncing'
                  : 'Not syncing'}
                <Info
                  info={
                    componentEditor.activeFrame.state.sync
                      ? "The Frame's View tree will be updated when there's a change made to State"
                      : 'Frame will not recompute its View tree'
                  }
                />
              </span>
            </div>
          </div>
          <div className="flex gap-2 items-center self-end justify-self-end">
            <MobileFallback
              size={1200}
              fallback={
                <Dropdown
                  items={[
                    {
                      title: 'Edit frame props',
                      onSelect: () => {
                        setEditFrame(true);
                      },
                    },
                    {
                      title: 'Remove frame',
                      onSelect: () => {
                        removeFrame();
                      },
                    },
                    {
                      title: 'Toggle View',
                      onSelect: () => {
                        setShowViewTree(!showViewTree);
                      },
                    },
                  ]}
                >
                  <IconButton>
                    <DotsHorizontalIcon />
                  </IconButton>
                </Dropdown>
              }
              render={
                <React.Fragment>
                  <Button
                    size="xs"
                    onClick={() => {
                      removeFrame();
                    }}
                  >
                    Remove Frame
                  </Button>
                  <Button
                    size="xs"
                    variant={'subtle'}
                    onClick={() => {
                      setEditFrame(true);
                    }}
                  >
                    Edit Frame Props
                  </Button>
                  <Button
                    size="xs"
                    variant="outline"
                    onClick={() => setShowViewTree(!showViewTree)}
                  >
                    Toggle View
                  </Button>
                </React.Fragment>
              }
            />
          </div>
        </motion.div>
      )}

      <AddFrameModal
        key={`${componentEditor.component.id}${
          isEditingFrame ? `-${componentEditor.activeFrame?.user.id}` : ''
        }`}
        component={componentEditor.component}
        isOpen={showAddFrameModal}
        frameId={
          isEditingFrame ? componentEditor.activeFrame?.user.id : undefined
        }
        onClose={() => {
          setEditFrame(false);
        }}
      />
    </div>
  );
});
