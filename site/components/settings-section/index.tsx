import { ChevronDownIcon, PlusIcon } from '@radix-ui/react-icons';
import { AnimatePresence, motion } from 'framer-motion';
import * as React from 'react';

import { IconButton } from '@app/components/button';
import { cn, CREATE_BEZIER_TRANSITION } from '@app/utils';

import { Info } from '../info';

type SettingSectionProps = {
  title: string;
  info?: string;
  onAdd?: () => void;
  children?: React.ReactNode;
  collapsedOnInitial?: boolean;
  className?: string;
};

export const SettingSection = (props: SettingSectionProps) => {
  const [isOpen, setIsOpen] = React.useState(
    props.collapsedOnInitial !== undefined ? !props.collapsedOnInitial : false
  );

  return (
    <div
      className={cn(
        'flex px-5 py-1.5 flex-col border-b border-solid border-outline setting-section last:border-none',
        props.className
      )}
    >
      <motion.div
        className="flex relative items-center cursor-pointer mt-2 mb-1"
        initial={false}
        animate={{ paddingBottom: isOpen ? '10px' : 0 }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <header className="flex flex-1 items-center">
          <span className="text-slate-800 text-sm font-medium flex items-center">
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
      </motion.div>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.section
            className="-mx-4"
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
            <div className="py-2 pb-4 px-4 h-full">{props.children}</div>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
};

SettingSection.toString = () => '.setting-section';
