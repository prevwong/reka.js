import {
  DotsHorizontalIcon,
  DoubleArrowRightIcon,
} from '@radix-ui/react-icons';
import { motion } from 'framer-motion';
import { observer } from 'mobx-react-lite';
import * as React from 'react';
import useIsomorphicLayoutEffect from 'react-use/lib/useIsomorphicLayoutEffect';

import { RENDER_FRAME_CONTAINER_CLASSNAME } from '@app/constants/css';
import { useEditor } from '@app/editor';
import { EditorMode } from '@app/editor/Editor';
import { UserFrameExtension } from '@app/extensions/UserFrameExtension';
import { cn, CREATE_BEZIER_TRANSITION } from '@app/utils';

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

const NoFrameSelectedMessage = () => {
  return (
    <div className="flex items-center justify-center text-center h-full w-full">
      <span className="text-gray-500 text-sm leading-6">
        No frame selected.
        <br />
        Click &quot;Add Frame&quot; to create one.
      </span>
    </div>
  );
};

export const ComponentEditorView = observer(() => {
  const editor = useEditor();

  const [showViewTree, setShowViewTree] = React.useState(false);
  const [showAddFrameModal, setShowAddFrameModal] = React.useState(false);
  const [isEditingFrame, setIsEditingFrame] = React.useState(false);

  const componentEditor = editor.activeComponentEditor;

  const containerDOMRef = React.useRef<HTMLDivElement | null>(null);
  const frameContainerDOMRef = React.useRef<HTMLDivElement | null>(null);
  const toolbarDOMRef = React.useRef<HTMLDivElement | null>(null);
  const bottomToolbarDOMRef = React.useRef<HTMLDivElement | null>(null);

  const [TOOLBAR_HEIGHT, setToolbarHeight] = React.useState(0);
  const [BOTTOM_TOOLBAR_HEIGHT, setBottomToolbarHeight] = React.useState(0);

  useIsomorphicLayoutEffect(() => {
    const { current: toolbarDOM } = toolbarDOMRef;
    const { current: bottomToolbarDOM } = bottomToolbarDOMRef;

    if (toolbarDOM) {
      setToolbarHeight(toolbarDOM.getBoundingClientRect().height);
    }

    if (bottomToolbarDOM) {
      setBottomToolbarHeight(bottomToolbarDOM.getBoundingClientRect().height);
    }
  }, [setToolbarHeight, setBottomToolbarHeight]);

  React.useEffect(() => {
    if (editor.mode !== EditorMode.Preview) {
      return;
    }

    setShowViewTree(false);
  }, [editor.mode, setShowViewTree]);

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
    if (!componentEditor) {
      return;
    }

    editor.reka.change(() => {
      const userFrame = componentEditor.activeFrame?.user;

      if (!userFrame) {
        return;
      }

      const userFrames =
        editor.reka.getExtension(UserFrameExtension).state.frames;

      userFrames.splice(userFrames.indexOf(userFrame), 1);

      const nextActiveFrame = userFrames.find(
        (frame) => frame.name === componentEditor.component.name
      );

      if (!nextActiveFrame) {
        return;
      }

      componentEditor.setActiveFrame(nextActiveFrame.id);
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
        ref={toolbarDOMRef}
        transition={CREATE_BEZIER_TRANSITION()}
      >
        <div className="flex gap-2 flex-1 items-center">
          {(editor.compactSidebar || editor.mode === EditorMode.Code) && (
            <Tooltip content="Toggle sidebar">
              <IconButton
                className="mr-1.5"
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

          <span className="text-slate-700">
            {componentEditor.component.name}
          </span>
          {frames.length > 0 && (
            <Select
              className="ml-2"
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

          <div className="flex items-center">
            <Button
              size="xs"
              variant="subtle"
              onClick={() => {
                setShowAddFrameModal(true);
              }}
            >
              Add Frame
            </Button>
            <Info
              className="text-gray-500"
              info="A Frame is an instance of a Reka Component"
            />
          </div>
        </div>
        <div className="flex items-center">
          <MobileFallback
            fallback={
              <Popover
                trigger={
                  <IconButton variant="outline">
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
              className={cn(
                RENDER_FRAME_CONTAINER_CLASSNAME,
                `w-full h-full overflow-hidden flex flex-1 items-center bg-canvas transition-all ease-all duration-800`,
                {
                  grayscale: !componentEditor.activeFrame.state.sync,
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
              <div className="flex flex-col relative bg-white w-[350px] border-l border-solid border-outline">
                <header className="px-5 py-2 border-b border-solid border-outline">
                  <h3 className="text-gray-800 text-sm font-medium flex items-center">
                    <span>View</span>
                    <Info info="The View is the render tree of a component" />
                  </h3>
                </header>
                <Tree
                  className="flex-1 overflow-auto pt-2 px w-full text-xs"
                  root={componentEditor.activeFrame.state.view}
                  renderAs={(node, key) => {
                    if (key !== 'owner') {
                      return null;
                    }

                    return (
                      <span>
                        <span className="text-primary">{`${node.type}<`}</span>
                        {node.id}
                        <span className="text-primary">{`>`}</span>
                      </span>
                    );
                  }}
                  shouldCollapseOnInitial={(_, key) => {
                    if (
                      key === 'template' ||
                      key === 'component' ||
                      key === 'owner'
                    ) {
                      return true;
                    }

                    return false;
                  }}
                />
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
          ref={bottomToolbarDOMRef}
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

              <span className="text-xs flex text-slate-700 items-center">
                {componentEditor.activeFrame?.state.sync
                  ? 'Syncing'
                  : 'Not syncing'}
                <Info
                  className="text-gray-500"
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
                  <IconButton variant="outline">
                    <DotsHorizontalIcon />
                  </IconButton>
                </Dropdown>
              }
              render={
                <React.Fragment>
                  <Button
                    size="xs"
                    className="hover:bg-red-100 hover:text-red-600"
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
