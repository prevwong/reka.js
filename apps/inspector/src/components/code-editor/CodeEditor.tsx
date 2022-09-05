import * as React from 'react';
import { EditorView, keymap } from '@codemirror/view';
import { EditorState, basicSetup } from '@codemirror/basic-setup';
import { indentWithTab } from '@codemirror/commands';
import * as t from '@composite/types';
import { Parser, Stringifier } from '@composite/parser';
import { composite } from '@composite/codemirror';

import { styled } from '@app/stitches.config';
import { useEditor } from '@app/editor';

import debounce from 'lodash/debounce';
import { observe } from 'mobx';
import { Box } from '../box';
import { ExternalLinkIcon } from '@radix-ui/react-icons';
import { Link } from '../link';
import { ParserStatus, ParserStatusBadge } from './ParserStatusBadge';

const diffAST = (oldAST: t.Program, newAST: t.Program) => {
  const oldComponents = oldAST.components;
  const newComponents = newAST.components;

  const componentsToInsert: [t.CompositeComponent, number][] = [];

  newComponents.forEach((newComponent, i) => {
    const existingComponent = oldComponents.find(
      (oldComponent) => oldComponent.name === newComponent.name
    );

    if (!existingComponent) {
      componentsToInsert.push([newComponent, i]);
      return;
    }

    t.mergeType(existingComponent, newComponent);
  });

  componentsToInsert.forEach(([component, index], i) => {
    oldComponents.splice(index + i, 0, component);
  });

  oldComponents
    .filter(
      (oldComponent) =>
        !newComponents.find(
          (newComponent) => newComponent.name === oldComponent.name
        )
    )
    .forEach((component) => {
      oldComponents.splice(oldComponents.indexOf(component), 1);
    });
};

const StyledCodeEditorContainer = styled('div', {
  height: '100%',
  flex: 1,
});

type CodeEditorProps = React.ComponentProps<typeof StyledCodeEditorContainer>;

const stringifier = new Stringifier();

export const CodeEditor = ({ css, ...props }: CodeEditorProps) => {
  const [status, setStatus] = React.useState<ParserStatus>({
    type: 'success',
  });

  const editor = useEditor();

  const domRef = React.useRef<HTMLDivElement | null>(null);

  const currentStateRef = React.useRef(t.Schema.fromJSON(editor.state.root));
  const currentCodeStringRef = React.useRef<string>(
    stringifier.toString(editor.state.root)
  );

  const isSynchingFromCodeMirror = React.useRef(false);
  const isSynchingFromExternal = React.useRef(false);
  const isTypingRef = React.useRef(false);

  const syncCodeToState = React.useCallback(
    debounce((code: string) => {
      if (isSynchingFromExternal.current) {
        return;
      }

      isSynchingFromCodeMirror.current = true;
      try {
        const parser = new Parser();
        const newAST = parser.parse(code);
        editor.state.change(() => {
          diffAST(currentStateRef.current, newAST);
          diffAST(editor.state.root, currentStateRef.current);
        });
        setStatus({
          type: 'success',
        });
      } catch (error) {
        setStatus({
          type: 'error',
          error: (error as unknown as any).message as string,
        });
      }
      isSynchingFromCodeMirror.current = false;
      isTypingRef.current = false;
    }, 1000),
    [editor]
  );

  const [codemirrorView, setCodemirrorView] = React.useState<EditorView | null>(
    null
  );

  React.useLayoutEffect(() => {
    const dom = domRef.current;

    if (!dom) {
      return;
    }

    setCodemirrorView(
      new EditorView({
        state: EditorState.create({
          doc: currentCodeStringRef.current,
          extensions: [
            basicSetup,
            keymap.of([indentWithTab]),
            composite(),
            EditorView.theme({
              '&.cm-focused': {
                outline: 'none!important',
              },
              '.cm-scroller': {
                'font-family': "'JetBrains Mono'",
                fontSize: '0.875em',
                lineHeight: '1.6em',
                wordBreak: 'break-word',
                '-webkit-font-smoothing': 'initial',
              },
            }),
            EditorView.updateListener.of((view) => {
              if (!view.docChanged || isSynchingFromExternal.current) {
                return;
              }

              isTypingRef.current = true;

              currentCodeStringRef.current = view.state.doc.toString();

              setStatus({
                type: 'parsing',
              });

              syncCodeToState(currentCodeStringRef.current);
            }),
          ],
        }),
        parent: dom,
      })
    );
  }, [syncCodeToState]);

  React.useEffect(() => {
    if (!codemirrorView) {
      return;
    }

    const disposeObserver = observe(editor.state.root, () => {
      onExternalChange();
    });

    return () => {
      codemirrorView.destroy();
      disposeObserver();
    };
  }, [codemirrorView]);

  const onExternalChange = React.useCallback(() => {
    if (isSynchingFromCodeMirror.current || isTypingRef.current) {
      return;
    }

    if (!codemirrorView) {
      return;
    }

    if (isSynchingFromExternal.current === false) {
      isSynchingFromExternal.current = true;

      Promise.resolve().then(() => {
        const oldCode = currentCodeStringRef.current;
        const newCode = stringifier.toString(editor.state.root);

        if (newCode === oldCode) {
          isSynchingFromExternal.current = false;
          return;
        }

        currentStateRef.current = t.Schema.fromJSON(editor.state.root);

        const transaction = codemirrorView.state.update({
          changes: {
            from: 0,
            to: codemirrorView.state.doc.length,
            insert: newCode,
          },
        });

        currentCodeStringRef.current = newCode;
        codemirrorView.dispatch(transaction);
        isSynchingFromExternal.current = false;
      });
    }
  }, [editor, codemirrorView]);

  // If the AST changes (ie: from undo/redo or from multiplayer),
  // Then, sync those changes to the CodeMirror editor
  React.useEffect(() => {
    const unsubscribe = editor.state.subscribe(() => {
      onExternalChange();
    });

    return () => {
      unsubscribe();
    };
  }, [editor, codemirrorView]);

  return (
    <Box css={{ ...css, height: '100%' }} {...props}>
      <Box css={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <StyledCodeEditorContainer ref={domRef} />
        <Box
          css={{
            display: 'flex',
            alignItems: 'center',
            py: '$2',
            px: '$2',
            borderTop: '1px solid $grayA5',
          }}
        >
          <Box css={{ flex: 1 }}>
            <Link
              css={{ fontSize: '12px' }}
              href="https://github.com/prevwong/composite/blob/main/docs/spec.ebnf"
              target="_blank"
            >
              View BNF spec <ExternalLinkIcon />
            </Link>
          </Box>
          <Box>
            <ParserStatusBadge status={status} />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
