import { Stack } from '@mui/system';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Typography, useTheme } from '@mui/material';
import useTranslationHook from '@/localization/hook';
import { NavigationButtonStyles } from './navigationButtonStyles';
import { JSX } from 'react';

function NavigationButtonUtils({ onPageChange }: { onPageChange: () => void }): JSX.Element {
  const theme = useTheme();
  const backButtonUtilsStyles = NavigationButtonStyles(theme);
  const { translate } = useTranslationHook();
  return (
    <Stack
      flexDirection="row"
      alignItems="center"
      gap={0.5}
      onClick={onPageChange}
      sx={backButtonUtilsStyles.stackStyle}
    >
      <ArrowBackIcon sx={backButtonUtilsStyles.arrowBackIcon} />
      <Typography variant="body1" sx={backButtonUtilsStyles.textStyle}>
        {translate('backButton')}
      </Typography>
    </Stack>
  );
}

export default NavigationButtonUtils;
