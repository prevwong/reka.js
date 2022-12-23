import { EditorState, basicSetup } from '@codemirror/basic-setup';
import { indentWithTab } from '@codemirror/commands';
import { EditorView, keymap } from '@codemirror/view';
import { composite } from '@composite/codemirror';
import { Parser } from '@composite/parser';
import * as t from '@composite/types';
import { ExternalLinkIcon } from '@radix-ui/react-icons';
import { motion } from 'framer-motion';
import debounce from 'lodash/debounce';
import { observe } from 'mobx';
import * as React from 'react';

import { useEditor } from '@app/editor';
import { styled } from '@app/styles';

import { ParserStatus, ParserStatusBadge } from './ParserStatusBadge';

import { Box } from '../box';
import { Link } from '../link';
import { Tree } from '../tree';

const _diffASTArrayTypes = <T extends t.Type>(
  program: t.Program,
  newProgram: t.Program,
  getTarget: (program: t.Program) => T[],
  isEqual: (a: T, b: T) => boolean
) => {
  const currentComponents = getTarget(program);
  const newComponents = getTarget(newProgram);

  const componentsToInsert: [T, number][] = [];

  newComponents.forEach((newComponent, i) => {
    const existingComponent = currentComponents.find((oldComponent) =>
      isEqual(oldComponent, newComponent)
    );

    if (!existingComponent) {
      componentsToInsert.push([newComponent, i]);
      return;
    }

    t.merge(existingComponent, newComponent);
  });

  componentsToInsert.forEach(([component, index], i) => {
    currentComponents.splice(index + i, 0, component);
  });

  currentComponents
    .filter(
      (oldComponent) =>
        !newComponents.find((newComponent) =>
          isEqual(oldComponent, newComponent)
        )
    )
    .forEach((component) => {
      currentComponents.splice(currentComponents.indexOf(component), 1);
    });
};

const diffAST = (program: t.Program, newProgram: t.Program) => {
  // Diff Globals
  _diffASTArrayTypes(
    program,
    newProgram,
    (program) => program.globals,
    (a, b) => a.name === b.name
  );

  // Diff components
  _diffASTArrayTypes(
    program,
    newProgram,
    (program) => program.components,
    (a, b) => a.name === b.name
  );
};

const StyledCodeEditorContainer = styled('div', {
  height: '100%',
  flex: 1,
});

const StyledTabItem = styled('button', {
  px: '$4',
  py: '$3',
  position: 'relative',
  cursor: 'pointer',
  fontSize: '$1',
  '&:hover': {
    backgroundColor: '$grayA2',
  },
});

const StyledTabItemUnderline = styled(motion.div, {
  position: 'absolute',
  bottom: '-1px',
  left: 0,
  width: '100%',
  height: '1px',
  background: '#000',
});

type CodeEditorProps = React.ComponentProps<typeof StyledCodeEditorContainer>;

const tabs = [
  {
    id: 'code',
    title: 'Code',
  },
  {
    id: 'ast',
    title: 'Syntax Tree',
  },
] as const;

export const CodeEditor = ({ css, ...props }: CodeEditorProps) => {
  const [currentTab, setCurrentTab] =
    React.useState<typeof tabs[number]['id']>('code');
  const [status, setStatus] = React.useState<ParserStatus>({
    type: 'success',
  });

  const editor = useEditor();

  const domRef = React.useRef<HTMLDivElement | null>(null);

  const currentStateRef = React.useRef(
    t.Schema.fromJSON(editor.composite.program)
  );
  const currentCodeStringRef = React.useRef<string>(
    Parser.stringify(editor.composite.program)
  );

  const isSynchingFromCodeMirror = React.useRef(false);
  const isSynchingFromExternal = React.useRef(false);
  const isTypingRef = React.useRef(false);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const syncCodeToState = React.useCallback(
    debounce((code: string) => {
      if (isSynchingFromExternal.current) {
        return;
      }

      isSynchingFromCodeMirror.current = true;
      try {
        const newAST = Parser.parse(code);
        editor.composite.change(() => {
          diffAST(currentStateRef.current, newAST);
          diffAST(editor.composite.program, currentStateRef.current);
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
        const newCode = Parser.stringify(editor.composite.program);

        if (newCode === oldCode) {
          isSynchingFromExternal.current = false;
          return;
        }

        currentStateRef.current = t.Schema.fromJSON(editor.composite.program);

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

  React.useEffect(() => {
    if (!codemirrorView) {
      return;
    }

    const disposeObserver = observe(editor.composite.program, () => {
      onExternalChange();
    });

    return () => {
      codemirrorView.destroy();
      disposeObserver();
    };
  }, [codemirrorView, onExternalChange, editor.composite.program]);

  // If the AST changes (ie: from undo/redo or from multiplayer),
  // Then, sync those changes to the CodeMirror editor
  React.useEffect(() => {
    const unsubscribe = editor.composite.listenToChanges(() => {
      onExternalChange();
    });

    return () => {
      unsubscribe();
    };
  }, [editor, codemirrorView, onExternalChange]);

  return (
    <Box css={{ ...css, height: '100%' }} {...props}>
      <Box css={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Box
          css={{
            display: 'flex',
            alignItems: 'center',
            borderBottom: '1px solid $grayA5',
          }}
        >
          <Box css={{ flex: 1 }}>
            {tabs.map((tab) => (
              <StyledTabItem
                key={tab.id}
                onClick={() => {
                  setCurrentTab(tab.id);
                }}
              >
                {tab.title}
                {currentTab === tab.id && (
                  <StyledTabItemUnderline layoutId="underline"></StyledTabItemUnderline>
                )}
              </StyledTabItem>
            ))}
          </Box>
          <Box
            css={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              px: '$4',
            }}
          >
            <Link
              css={{ fontSize: '$1', display: 'flex', alignItems: 'center' }}
              href="https://github.com/prevwong/composite/blob/main/docs/spec.ebnf"
              target="_blank"
            >
              View BNF spec <ExternalLinkIcon />
            </Link>
            <ParserStatusBadge status={status} />
          </Box>
        </Box>
        <Box
          css={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          <Box
            css={{
              height: '100%',
              display: currentTab === 'code' ? 'block' : 'none',
            }}
          >
            <StyledCodeEditorContainer ref={domRef} />
          </Box>
          <Box
            css={{
              overflow: 'auto',
              py: '$4',
              display: currentTab === 'ast' ? 'block' : 'none',
            }}
          >
            <Tree root={editor.composite.program} />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
