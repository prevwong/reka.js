import * as React from 'react';

import { styled } from '@app/stitches.config';
import { Box } from '@app/components/box';
import { ReactComponent as LogoIcon } from '@app/assets/logo.svg';

const LogoText = styled('h2', {
  fontWeight: '500',
  fontSize: '$2',
});

const StyledLogoIcon = styled(LogoIcon, {
  width: '20px',
  height: 'auto',
});

export const Header = () => {
  return (
    <Box
      css={{
        backgroundColor: 'rgb(225 225 225 / 100%)',
        backdropFilter: 'blur(5px)',
        color: '$grayA12',
        px: '$3',
        py: '$2',
      }}
    >
      <Box css={{ display: 'flex', ai: 'center' }}>
        <Box css={{ display: 'flex', flex: 1 }}>
          <StyledLogoIcon />
          <Box css={{ ml: '$2' }}>
            <LogoText>craft.js | composite</LogoText>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
