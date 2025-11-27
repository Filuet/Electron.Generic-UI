import { CssBaseline, StyledEngineProvider } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { ThemeCustomizationProps } from '@/interfaces/modal';
import { JSX, useMemo } from 'react';
import Palette from './palettes';
import componentStyleOverrides from './componentStyleOverride';
import Typography from './typography';

export default function ThemeCustomization({
  children,
  mode = 'light',
  presetColor = 'themeOriflame',
  fontFamily = 'SansOri,sans-serif',
  direction = 'ltr'
}: ThemeCustomizationProps): JSX.Element {
  const theme = useMemo(() => Palette(presetColor, mode), [presetColor, mode]);
  const themeTypography = useMemo(() => Typography(theme, fontFamily), [theme, fontFamily]);

  const themeOptions = useMemo(
    () => ({
      direction,
      palette: theme.palette,
      mixins: {
        toolbar: {
          minHeight: '2rem',
          padding: '1rem',
          '@media (min-width: 600px)': {
            minHeight: '2rem'
          }
        }
      },
      typography: themeTypography
    }),
    [theme, themeTypography, direction]
  );

  const themes = useMemo(() => createTheme(themeOptions), [themeOptions]);

  themes.components = useMemo(() => componentStyleOverrides(themes), [themes]);

  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={themes}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </StyledEngineProvider>
  );
}
