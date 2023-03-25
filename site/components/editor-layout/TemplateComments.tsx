import { observer, useReka } from '@rekajs/react';
import { formatDistance } from 'date-fns';
import * as React from 'react';

import { useEditor } from '@app/editor';
import { ActiveFrame } from '@app/editor/ComponentEditor';
import { Comment, CommentExtension } from '@app/extensions/CommentExtension';

import { TextField } from '../text-field';
import { UserAvatar } from '../user-avatar';

type TemplateCommentsProps = {
  activeFrame: ActiveFrame;
};

type InternalTemplateCommentsProps = {
  iframeDOM: HTMLIFrameElement;
  templateDOM: HTMLElement;
  templateId: string;
};

const InternalTemplateComments = (props: InternalTemplateCommentsProps) => {
  const editor = useEditor();
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  const { comments } = useReka((reka) => {
    const comments: Comment[] =
      reka.getExtension(CommentExtension).state.templateToComments[
        props.templateId
      ] ?? [];

    return {
      comments,
    };
  });

  const setPos = React.useCallback(() => {
    const { current: containerDOM } = containerRef;

    if (!containerDOM) {
      return;
    }

    const domRect = props.templateDOM.getBoundingClientRect();
    const containerDomRect = containerDOM.getBoundingClientRect();

    const top = props.iframeDOM.offsetTop + domRect.top;
    const left =
      props.iframeDOM.offsetLeft +
      domRect.left +
      domRect.width -
      containerDomRect.width;

    containerDOM.style.top = `${top}px`;
    containerDOM.style.left = `${left}px`;
  }, [props.templateDOM, props.iframeDOM]);

  React.useEffect(() => {
    setPos();

    let animationReq: number | null;

    const animationLoop = () => {
      setPos();

      animationReq = window.requestAnimationFrame(() => {
        animationLoop();
      });
    };

    animationReq = window.requestAnimationFrame(() => animationLoop());

    return () => {
      animationReq !== null && window.cancelAnimationFrame(animationReq);
    };
  }, [setPos]);

  React.useEffect(() => {
    const { current: containerDOM } = containerRef;

    if (!containerDOM) {
      return;
    }

    const hideComments = () => {
      editor.activeComponentEditor?.hideComments();
    };

    const onClickOutside = (e: any) => {
      if (!e.target) {
        return;
      }

      if (containerDOM.contains(e.target as HTMLElement)) {
        return;
      }
      hideComments();
    };

    props.iframeDOM.contentDocument?.addEventListener('click', hideComments);
    document.addEventListener('mouseup', onClickOutside);

    return () => {
      document.removeEventListener('mouseup', onClickOutside);
      props.iframeDOM.contentDocument?.removeEventListener(
        'click',
        onClickOutside
      );
    };
  }, [editor, props.iframeDOM]);

  return (
    <div
      className="bg-white/80 backdrop-blur-md flex flex-col fixed w-72 z-max rounded-md shadow-xl"
      ref={containerRef}
    >
      <div className="overflow-auto px-4 py-4 max-h-52">
        {comments.length === 0 ? (
          <span className="text-xs text-gray-500">No comments yet</span>
        ) : (
          <React.Fragment>
            {comments
              .slice()
              .sort((a, b) => (a.date < b.date ? 1 : -1))
              .map((comment, i) => {
                return (
                  <div className="py-3 gap-4 flex" key={i}>
                    <div className="mt-1">
                      <UserAvatar user={comment.user} />
                    </div>
                    <div className="flex flex-col flex-1">
                      <span className="text-gray-700 text-sm">
                        {comment.user.name}
                      </span>
                      <span className="text-gray-600 text-xs">
                        {comment.content}
                      </span>
                      <span className="text-gray-500 text-xs mt-0.5">
                        {formatDistance(comment.date, Date.now(), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                  </div>
                );
              })}
          </React.Fragment>
        )}
      </div>
      <div className="px-4 pb-4">
        <TextField
          placeholder="Add a new comment"
          value=""
          onCommit={(content, clear) => {
            editor.reka.change(() => {
              const comments =
                editor.reka.getExtension(CommentExtension).state
                  .templateToComments;

              if (!comments[props.templateId]) {
                comments[props.templateId] = [];
              }

              comments[props.templateId].push({
                content,
                user: editor.user,
                date: Date.now(),
              });

              clear();
            });
          }}
        />
      </div>
    </div>
  );
};

export const TemplateComments = observer((props: TemplateCommentsProps) => {
  const editor = useEditor();
  const iframe = editor.iframe;

  const template = props.activeFrame.templateToShowComments;

  if (!template || !iframe) {
    return null;
  }

  const doms = props.activeFrame.tplElements.get(template);

  if (!doms) {
    return null;
  }

  const [dom] = doms;

  if (!dom) {
    return null;
  }

  return (
    <InternalTemplateComments
      templateId={template.id}
      templateDOM={dom}
      iframeDOM={iframe}
    />
  );
});
