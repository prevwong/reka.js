import { observer } from 'mobx-react-lite';
import Image from 'next/image';
import Link from 'next/link';
import * as React from 'react';

import {
  SITE_LAYOUT_HEADER_CLASSNAME,
  SITE_LAYOUT_HEADER_TOOLBAR_CLASSNAME,
} from '@app/constants/css';

const MENU_ITEMS = [
  { title: 'Github', link: 'https://github.com/prevwong/reka.js' },
  { title: 'Documentation', link: '/docs/introduction' },
];

export const Header = observer(() => {
  return (
    <div className={SITE_LAYOUT_HEADER_CLASSNAME}>
      <div className="flex items-center">
        <div className="flex flex-1 items-center">
          <Link href="/">
            <Image
              src="/logo.svg"
              width={30}
              height={30}
              style={{ cursor: 'pointer' }}
            />
          </Link>
          <div className="flex gap-4 ml-6 [&>a]:text-sm [&>a]:cursor-pointer [&>a]:text-decoration-none [&>a]:font-medium [&>a]:text-neutral-800">
            {MENU_ITEMS.map((item, i) => {
              const isExternalURL = item.link.startsWith('http');

              if (isExternalURL) {
                return (
                  <a key={i} href={item.link} target="_blank" rel="noreferrer">
                    {item.title}
                  </a>
                );
              }

              return (
                <Link key={i} href={item.link}>
                  {item.title}
                </Link>
              );
            })}
          </div>
        </div>
        <div className={SITE_LAYOUT_HEADER_TOOLBAR_CLASSNAME}></div>
      </div>
    </div>
  );
});
