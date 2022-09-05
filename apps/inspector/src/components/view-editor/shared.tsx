import { styled } from '../../stitches.config';

export const SettingField = styled('div', {
  display: 'grid',
  gridTemplateColumns: '60px 1fr',
  alignItems: 'center',
  position: 'relative',
  gap: '$2',
});

export const SettingSection = styled('div', {
  display: 'flex',
  mt: '$2',
  flexDirection: 'column',
  gap: '10px',
  '> h4': {
    mb: '-$1',
    color: 'rgba(255,255,255,0.5)',
    fontSize: '12px',
  },
});
