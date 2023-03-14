import * as React from 'react';

export const Footer = () => {
  return (
    <div className="px-4 py-6 border-t border-solid border-t-gray-200 text-xs  text-slate-600 flex [&>a]:text-decoration-none">
      <div className="flex flex-col gap-2 m-auto w-auto flex-1">
        <div>
          Made with <span className=" text-primary inline m-0">♥︎</span> by{' '}
          <a
            href="https://twitter.com/prevwong"
            target="_blank"
            rel="noreferrer"
          >
            @prevwong
          </a>
        </div>
        <div>
          Reka is released under the{' '}
          <a
            href="https://github.com/prevwong/reka.js/blob/main/LICENSE"
            target="_blank"
            rel="noreferrer"
          >
            MIT license
          </a>
        </div>
      </div>
    </div>
  );
};
