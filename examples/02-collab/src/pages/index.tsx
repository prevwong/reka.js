import { RekaProvider } from '@rekajs/react';
import * as t from '@rekajs/types';
import Script from 'next/script';
import * as React from 'react';

import { Editor } from '@/components/Editor';
import { Preview } from '@/components/Preview';
import { setup } from '@/utils';

const reka = setup();

reka.createFrame({
  id: 'Main app',
  component: {
    name: 'App',
  },
});

reka.createFrame({
  id: 'Primary button',
  component: {
    name: 'Button',
    props: {
      text: t.literal({ value: 'Primary button' }),
    },
  },
});

export default function Home() {
  return (
    <RekaProvider state={reka}>
      {/* Use Tailwind CDN so that tailwind classes used within our Reka component gets injected on-demand */}
      <Script src="https://cdn.tailwindcss.com"></Script>
      <div className="flex h-screen">
        <div className="w-3/6 h-full border-r-2">
          <Editor />
        </div>
        <div className="flex-1">
          <Preview />
        </div>
      </div>
    </RekaProvider>
  );
}
