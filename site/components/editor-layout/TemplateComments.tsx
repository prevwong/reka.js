import { observer, useCollector } from '@composite/react';
import * as React from 'react';

import { useEditor } from '@app/editor';
import { ActiveFrame } from '@app/editor/ComponentEditor';
import { Comment, CommentExtension } from '@app/extensions/CommentExtension';
import { styled } from '@app/styles';

import { Box } from '../box';
import { Text } from '../text';
import { EnterTextField } from '../text-field';
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

export const TemplateComments = observer((props: TemplateCommentsProps) => {
  const editor = useEditor();
  const iframe = editor.iframe;
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  const template = props.activeFrame.templateToShowComments;

  const { id, comments } = useCollector((composite) => {
    let comments: Comment[] = [];
    let id;

    if (props.activeFrame.templateToShowComments) {
      // const extension = composite.getExtension(CommentExtension)['_state'];

      const _c =
        composite.getExtension(CommentExtension).state.templateToComments[
          props.activeFrame.templateToShowComments.id
        ] ?? [];

      console.log('recompute', composite.getExtension(CommentExtension).state);
      // id = extension.id;
      comments = _c.map((c: any) => c) ?? [];
    }

    return {
      id,
      comments,
    };
  });

  console.log('comments', id, comments);

  if (!template || !iframe) {
    return null;
  }

  const doms = props.activeFrame.tplElements.get(template);

  if (!doms) {
    return null;
  }

  const [dom] = doms;

  const domRect = dom.getBoundingClientRect();
  const iframeRect = iframe.getBoundingClientRect();

  return (
    <StyledContainer
      ref={containerRef}
      style={{
        top: iframeRect.top + domRect.top,
        left: iframeRect.left + domRect.left,
      }}
    >
      <Box css={{ maxHeight: '200px', overflow: 'auto', px: '$4', py: '$4' }}>
        {comments.length === 0 ? (
          <Text size={1} css={{ color: '$gray10' }}>
            No comments yet
          </Text>
        ) : (
          <React.Fragment>
            {comments.map((comment, i) => {
              return (
                <StyledCommentItem key={i}>
                  <UserAvatar userId={comment.userId} />
                  <Box
                    css={{ flex: 1, display: 'flex', flexDirection: 'column' }}
                  >
                    <Text
                      size={2}
                      css={{ mb: '$2', fontWeight: 500, color: '$slate11' }}
                    >
                      {editor.getUserById(comment.userId)?.name ?? 'Unknown'}
                    </Text>
                    <Text size={1} css={{ color: '$slate11' }}>
                      {comment.content}
                    </Text>
                  </Box>
                </StyledCommentItem>
              );
            })}
          </React.Fragment>
        )}
      </Box>
      <Box css={{ px: '$4', pb: '$4' }}>
        <EnterTextField
          placeholder="Add a new comment"
          value=""
          onCommit={(content) => {
            editor.composite.change(() => {
              const extension = editor.composite.getExtension(CommentExtension);

              console.log('comments push', extension);

              const comments =
                editor.composite.getExtension(CommentExtension).state
                  .templateToComments;

              if (!comments[template.id]) {
                comments[template.id] = [];
              }

              comments[template.id].push({
                content,
                userId: editor.user.id,
              });
            });
          }}
        />
      </Box>
    </StyledContainer>
  );
});
