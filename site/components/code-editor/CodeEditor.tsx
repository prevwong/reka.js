import {
  CodeEditor as ReactCodeEditor,
  ParserStatus,
} from '@rekajs/react-code-editor';
import { motion } from 'framer-motion';
import * as React from 'react';

import { useEditor } from '@app/editor';
import { cn } from '@app/utils';

import { ParserStatusBadge } from './ParserStatusBadge';

import { Tree } from '../tree';

type CodeEditorProps = {
  className?: string;
};

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

export const CodeEditor = ({ className, ...props }: CodeEditorProps) => {
  const [currentTab, setCurrentTab] =
    React.useState<typeof tabs[number]['id']>('code');

  const [status, setStatus] = React.useState<ParserStatus>({
    type: 'success',
  });
  const editor = useEditor();

  return (
    <div className={cn(className, 'h-full')} {...props}>
      <div className="flex flex-col h-full">
        <div className="flex items-center border-b border-solid border-b-neutral-200">
          <div className="flex-1">
            {tabs.map((tab) => (
              <button
                className="cursor-pointer leading-6 relative text-sm px-4 py-[0.83rem] hover:bg-neutral-200"
                key={tab.id}
                onClick={() => {
                  setCurrentTab(tab.id);
                }}
              >
                {tab.title}
                {currentTab === tab.id && (
                  <motion.div
                    className="absolute left-0 -bottom-px w-full h-px bg-black"
                    layoutId="underline"
                  ></motion.div>
                )}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2.5 px-4 py-2">
            <ParserStatusBadge status={status} />
          </div>
        </div>
        <div className="flex-1 flex flex-col overflow-hidden">
          <div
            className={cn('h-full', {
              block: currentTab === 'code',
              hidden: currentTab !== 'code',
            })}
          >
            <ReactCodeEditor
              className="h-full flex-1"
              onStatusChange={(status) => {
                setStatus(status);
              }}
            />
          </div>
          <div
            className={cn('overflow-auto py-4', {
              block: currentTab === 'ast',
              hidden: currentTab !== 'ast',
            })}
          >
            <Tree root={editor.reka.program} />
          </div>
        </div>
      </div>
    </div>
  );
};
