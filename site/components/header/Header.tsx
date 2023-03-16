import { observer } from 'mobx-react-lite';
import Image from 'next/image';
import Link from 'next/link';
import * as React from 'react';

import {
  SITE_LAYOUT_HEADER_CLASSNAME,
  SITE_LAYOUT_HEADER_TOOLBAR_CLASSNAME,
} from '@app/constants/css';

export const Header = observer(() => {
  return (
    <div className={SITE_LAYOUT_HEADER_CLASSNAME}>
      <div className="flex items-center">
        <div className="flex flex-1 items-center">
          <div className="ml-2">
            <Link href="/">
              <a>
                <Image
                  src="/logo.svg"
                  width={30}
                  height={30}
                  style={{ cursor: 'pointer' }}
                />
              </a>
            </Link>
          </div>
          <div className="flex gap-4 ml-6 [&>a]:text-sm [&>a]:cursor-pointer [&>a]:text-decoration-none [&>a]:text-slate-900">
            <a href="https://github.com/prevwong/reka.js" target="__blank">
              Github
            </a>
            <Link href="/docs/introduction">Documentation</Link>
          </div>
        </div>
        <div className={SITE_LAYOUT_HEADER_TOOLBAR_CLASSNAME}></div>
      </div>
    </div>
  );
});
