import * as React from 'react';

import { styled } from '@app/styles';
import { IconButton } from '../button';
import { TextField } from '../text-field';

export const SettingField = styled('div', {
  display: 'grid',
  gridTemplateColumns: '60px 1fr',
  alignItems: 'center',
  position: 'relative',
  gap: '$2',
});

export const EditPropSettingsField = styled(SettingField, {
  gridTemplateColumns: '60px 1fr',
  position: 'relative',
  gap: '0px',
  [`& ${TextField}:nth-child(1)`]: {
    borderRight: 'none',
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
  },
  [`& ${TextField}:nth-child(2)`]: {
    paddingRight: '$3',
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
  },
  mb: '-1px',
  [`& ${IconButton}`]: {
    opacity: 0,
    position: 'absolute',
    top: '4px',
    right: '$1',
  },
  '&:hover': {
    [`& ${IconButton}`]: {
      opacity: 1,
    },
  },
});

const StyledSettingSectionHeader = styled('div', {
  display: 'flex',
  alignItems: 'center',
  mb: '$4',
  '> h4': {
    mb: '-$1',
    color: '$grayA12',
    fontSize: '13px',
    fontWeight: '500',
    flex: 1,
  },
});

const StyledSettingSection = styled('div', {
  display: 'flex',
  mt: '$4',
  flexDirection: 'column',
});

type SettingSectionProps = {
  title: {
    name: string;
    after?: React.ReactElement;
  };
  children?: React.ReactNode;
};

export const SettingSection = (props: SettingSectionProps) => {
  return (
    <StyledSettingSection>
      <StyledSettingSectionHeader>
        <h4>{props.title.name}</h4>
        {props.title.after}
      </StyledSettingSectionHeader>
      {props.children}
    </StyledSettingSection>
  );
};
