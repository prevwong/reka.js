import { ChevronDownIcon, PlusIcon } from '@radix-ui/react-icons';
import { AnimatePresence, motion } from 'framer-motion';
import * as React from 'react';

import { IconButton } from '@app/components/button';
import { styled } from '@app/styles';
import { CREATE_BEZIER_TRANSITION } from '@app/utils';

import { Box } from '../box';
import { Info } from '../info';

const StyledSettingSectionHeader = styled(motion.div, {
  display: 'flex',
  position: 'relative',
  alignItems: 'center',
  cursor: 'pointer',
  mt: '2px',
  mb: '1px',

  '> header': {
    flex: 1,

    display: 'flex',
    '> span': {
      mb: '-$1',
      color: '$grayA12',
      fontSize: '$2',
      fontWeight: '500',
      display: 'flex',
      alignItems: 'center',
    },
  },
});

const StyledSettingSection = styled('div', {
  display: 'flex',
  px: '$4',
  py: '$3',
  flexDirection: 'column',
  borderBottom: '1px solid $grayA5',
  '&:last-child': {
    borderBottomColor: 'transparent',
  },
});

const StyledSettingSectionContent = styled(motion.section, {
  marginLeft: '-$4',
  marginRight: '-$4',
});

type SettingSectionProps = {
  title: string;
  info?: string;
  onAdd?: () => void;
  children?: React.ReactNode;
  collapsedOnInitial?: boolean;
};

export const SettingSection = (props: SettingSectionProps) => {
  const [isOpen, setIsOpen] = React.useState(
    props.collapsedOnInitial !== undefined ? !props.collapsedOnInitial : false
  );

  return (
    <StyledSettingSection className="setting-section">
      <StyledSettingSectionHeader
        initial={false}
        animate={{ paddingBottom: isOpen ? '10px' : 0 }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <header>
          <span>
            {props.title}
            {props.info && <Info info={props.info} />}
          </span>

          <IconButton className="ml-1">
            <ChevronDownIcon />
          </IconButton>
        </header>

        {props.onAdd && (
          <IconButton
            onClick={(e) => {
              if (!props.onAdd) {
                return;
              }

              setIsOpen(true);
              e.stopPropagation();

              props.onAdd();
            }}
          >
            <PlusIcon />
          </IconButton>
        )}
      </StyledSettingSectionHeader>
      <AnimatePresence initial={false}>
        {isOpen && (
          <StyledSettingSectionContent
            key="content"
            initial="collapsed"
            animate="open"
            exit="collapsed"
            variants={{
              open: { opacity: 1, height: 'auto', overflow: 'unset' },
              collapsed: {
                opacity: 0,
                height: 0,
                paddingBottom: 0,
                overflow: 'hidden',
              },
            }}
            transition={CREATE_BEZIER_TRANSITION()}
          >
            <Box css={{ py: '$2', pb: '$4', px: '$4' }}>{props.children}</Box>
          </StyledSettingSectionContent>
        )}
      </AnimatePresence>
    </StyledSettingSection>
  );
};

SettingSection.toString = () => '.setting-section';
