import { observer } from 'mobx-react-lite';
import Image from 'next/image';
import Link from 'next/link';
import * as React from 'react';

import { Box } from '@app/components/box';
import {
  SITE_LAYOUT_HEADER_CLASSNAME,
  SITE_LAYOUT_HEADER_TOOLBAR_CLASSNAME,
} from '@app/constants/css';
import { styled } from '@app/styles';

export const HEADER_HEIGHT = 50;

const Menu = styled('div', {
  display: 'flex',
  gap: '$4',
  ml: '$5',
  '> a': {
    fontSize: '$2',
    cursor: 'pointer',
    textDecoration: 'none',
    color: '$slate12',
  },
});

export const Header = observer(() => {
  return (
    <div className={SITE_LAYOUT_HEADER_CLASSNAME}>
      <Box css={{ display: 'flex', ai: 'center' }}>
        <Box css={{ display: 'flex', flex: 1, ai: 'center' }}>
          <Box css={{ ml: '$2' }}>
            <Link href="/">
              <Image
                src="/logo.svg"
                width={30}
                height={30}
                style={{ cursor: 'pointer' }}
              />
            </Link>
          </Box>
          <Menu>
            <a href="https://github.com/prevwong/reka.js" target="__blank">
              Github
            </a>
            <Link href="/docs/introduction">Documentation</Link>
          </Menu>
        </Box>
        <div className={SITE_LAYOUT_HEADER_TOOLBAR_CLASSNAME}></div>
      </Box>
    </div>
  );
});
