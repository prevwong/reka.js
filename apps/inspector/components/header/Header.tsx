import * as React from 'react';

import { styled } from '@app/styles';
import { Box } from '@app/components/box';
import Image from 'next/image';
import { Button } from '../button';
import { Collaborators } from '../editor-panel/Collaborators';

const LogoText = styled('h2', {
  fontWeight: '500',
  fontSize: '$3',
});

// const StyledLogoIcon = styled(LogoIcon, {
//   width: '20px',
//   height: 'auto',
// });

export const Header = () => {
  return (
    <Box
      css={{
        backgroundColor: '#fff',
        backdropFilter: 'blur(5px)',
        color: '$grayA12',
        px: '$4',
        py: '$3',
        borderBottom: '1px solid $grayA5',
      }}
    >
      <Box css={{ display: 'flex', ai: 'center' }}>
        <Box css={{ display: 'flex', flex: 1 }}>
          <Box css={{ ml: '$2' }}>
            <Image src="/logo.svg" width={30} height={30} />
          </Box>
        </Box>
        <Box css={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Collaborators />
          <Button variant="secondary" css={{ py: '$3', px: '$4' }}>
            View code
          </Button>
        </Box>
      </Box>
    </Box>
  );
};
