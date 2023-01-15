import { EditorState, basicSetup } from '@codemirror/basic-setup';
import { indentWithTab } from '@codemirror/commands';
import { EditorView, keymap } from '@codemirror/view';
import { composite as compositeCodemirrorExtension } from '@composite/codemirror';
import { Parser } from '@composite/parser';
import { useCollector } from '@composite/react';
import * as t from '@composite/types';
import debounce from 'lodash/debounce';
import * as React from 'react';

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

type ParsingStatus = {
  type: 'parsing';
};

type ErrorStatus = {
  type: 'error';
  error: string;
};

type SuccessStatus = {
  type: 'success';
};

export type ParserStatus = ParsingStatus | ErrorStatus | SuccessStatus;

type CodeEditorProps = React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
> & {
  onStatusChange?: (status: ParserStatus) => void;
};

export const CodeEditor = (props: CodeEditorProps) => {
  const { composite } = useCollector();

  const domRef = React.useRef<HTMLDivElement | null>(null);

  const currentStateRef = React.useRef(t.Schema.fromJSON(composite.program));
  const currentCodeStringRef = React.useRef<string>(
    Parser.stringify(composite.program)
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
        const newAST = Parser.parseProgram(code);
        composite.change(() => {
          diffAST(currentStateRef.current, newAST);
          diffAST(composite.program, currentStateRef.current);
        });

        props.onStatusChange?.({
          type: 'success',
        });
      } catch (error) {
        props.onStatusChange?.({
          type: 'error',
          error: (error as unknown as any).message as string,
        });
      }
      isSynchingFromCodeMirror.current = false;
      isTypingRef.current = false;
    }, 1000),
    [composite]
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
            compositeCodemirrorExtension(),
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

              props.onStatusChange?.({
                type: 'parsing',
              });

              syncCodeToState(currentCodeStringRef.current);
            }),
          ],
        }),
        parent: dom,
      })
    );
  }, [syncCodeToState, props]);

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
        const newCode = Parser.stringify(composite.program);

        if (newCode === oldCode) {
          isSynchingFromExternal.current = false;
          return;
        }

        currentStateRef.current = t.Schema.fromJSON(composite.program);

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
  }, [composite, codemirrorView]);

  // If the AST changes (ie: from undo/redo or from multiplayer),
  // Then, sync those changes to the CodeMirror editor
  React.useEffect(() => {
    const unsubscribe = composite.listenToChanges((payload) => {
      if (payload.event !== 'change') {
        return;
      }

      onExternalChange();
    });

    return () => {
      unsubscribe();
    };
  }, [composite, codemirrorView, onExternalChange]);

  return <div {...props} ref={domRef} />;
};

CodeEditor.toString = () => '.composite-react-code-editor';
