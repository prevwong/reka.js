import * as React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { styled } from '@app/styles';
import { IconButton } from '@app/components/button';
import { ChevronDownIcon, PlusIcon } from '@radix-ui/react-icons';

const StyledSettingSectionHeader = styled(motion.div, {
  display: 'flex',
  position: 'relative',
  alignItems: 'center',
  cursor: 'pointer',
  background: '#fff',
  zIndex: '9',

  '> header': {
    flex: 1,
    '> span': {
      mb: '-$1',
      color: '$grayA12',
      fontSize: '$2',
      fontWeight: '500',
      flex: 1,
    },
  },
});

const StyledSettingSection = styled('div', {
  display: 'flex',
  px: '$3',
  py: '$4',
  mt: '$2',
  flexDirection: 'column',
  borderBottom: '1px solid $grayA5',
  '&:last-child': {
    borderBottomColor: 'transparent',
  },
});

type SettingSectionProps = {
  title: string;
  onAdd?: () => void;
  children?: React.ReactNode;
};

export const SettingSection = (props: SettingSectionProps) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <StyledSettingSection className="setting-section">
      <StyledSettingSectionHeader
        initial={false}
        animate={{ paddingBottom: isOpen ? '10px' : 0 }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <header>
          <span>{props.title}</span>
          <IconButton transparent css={{ ml: '$2' }}>
            <ChevronDownIcon />
          </IconButton>
        </header>

        {props.onAdd && (
          <IconButton
            transparent
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
          <motion.section
            key="content"
            initial="collapsed"
            animate="open"
            exit="collapsed"
            variants={{
              open: { opacity: 1, height: 'auto' },
              collapsed: { opacity: 0, height: 0 },
            }}
            transition={{ duration: 0.2, ease: [0.04, 0.62, 0.23, 0.98] }}
          >
            {props.children}
          </motion.section>
        )}
      </AnimatePresence>
    </StyledSettingSection>
  );
};

SettingSection.toString = () => '.setting-section';
