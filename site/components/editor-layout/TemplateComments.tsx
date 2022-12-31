import { observer, useCollector } from '@composite/react';
import { formatDistance } from 'date-fns';
import * as React from 'react';

import { useEditor } from '@app/editor';
import { ActiveFrame } from '@app/editor/ComponentEditor';
import { Comment, CommentExtension } from '@app/extensions/CommentExtension';
import { styled } from '@app/styles';

import { Box } from '../box';
import { Text } from '../text';
import { TextField } from '../text-field';
import { UserAvatar } from '../user-avatar';

type TemplateCommentsProps = {
  activeFrame: ActiveFrame;
};

const StyledContainer = styled('div', {
  background: 'rgba(255,255,255,0.8)',
  backdropFilter: 'blur(10px)',
  display: 'flex',
  flexDirection: 'column',
  position: 'fixed',
  zIndex: '$4',
  borderRadius: '$2',
  boxShadow: '0px 0px 30px 10px rgb(0 0 0 / 12%)',
});

const StyledCommentItem = styled('div', {
  py: '$3',
  display: 'flex',
  gap: '$3',
});

type InternalTemplateCommentsProps = {
  iframeDOM: HTMLIFrameElement;
  templateDOM: HTMLElement;
  templateId: string;
};

const InternalTemplateComments = (props: InternalTemplateCommentsProps) => {
  const editor = useEditor();
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  const { comments } = useCollector((composite) => {
    const comments: Comment[] =
      composite.getExtension(CommentExtension).state.templateToComments[
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
    const iframeRect = props.iframeDOM.getBoundingClientRect();

    const top = iframeRect.top + domRect.top + 10;
    const left = iframeRect.left + domRect.left + domRect.width + 10;

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
    <StyledContainer ref={containerRef}>
      <Box css={{ maxHeight: '200px', overflow: 'auto', px: '$4', py: '$4' }}>
        {comments.length === 0 ? (
          <Text size={1} css={{ color: '$gray10' }}>
            No comments yet
          </Text>
        ) : (
          <React.Fragment>
            {comments
              .sort((a, b) => (a.date < b.date ? 1 : -1))
              .map((comment, i) => {
                return (
                  <StyledCommentItem key={i}>
                    <Box css={{ mt: '$1' }}>
                      <UserAvatar user={comment.user} />
                    </Box>
                    <Box
                      css={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                      }}
                    >
                      <Text
                        size={2}
                        css={{ mb: '$2', fontWeight: 500, color: '$slate11' }}
                      >
                        {comment.user.name}
                      </Text>
                      <Text size={1} css={{ mb: '$2', color: '$slate11' }}>
                        {comment.content}
                      </Text>
                      <Text size={1} css={{ color: '$slate10' }}>
                        {formatDistance(comment.date, Date.now(), {
                          addSuffix: true,
                        })}
                      </Text>
                    </Box>
                  </StyledCommentItem>
                );
              })}
          </React.Fragment>
        )}
      </Box>
      <Box css={{ px: '$4', pb: '$4' }}>
        <TextField
          placeholder="Add a new comment"
          value=""
          onCommit={(content) => {
            editor.composite.change(() => {
              const extension = editor.composite.getExtension(CommentExtension);

              console.log('comments push', extension);

              const comments =
                editor.composite.getExtension(CommentExtension).state
                  .templateToComments;

              if (!comments[props.templateId]) {
                comments[props.templateId] = [];
              }

              comments[props.templateId].push({
                content,
                user: editor.user,
                date: Date.now(),
              });
            });
          }}
        />
      </Box>
    </StyledContainer>
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
