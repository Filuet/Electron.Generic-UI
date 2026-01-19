import { Typography, useTheme, Box, Container } from '@mui/material';
import { GlobalStyles } from '@/globalStyles/globalStyles';
import { useAppSelector } from '@/redux/core/utils/reduxHook';
import { useKioskReset } from '@/hooks/useKioskReset';
import UserWelcomeBanner from '../../assets/images/Banners/Kiosk_Welcome_Page_Banner.jpg';
import OriflameLogo from '../../assets/images/Logo/Oriflame_logo_WelcomePage.png';
import { JSX } from 'react';

function NonWorkingHours(): JSX.Element {
  const theme = useTheme();
  const globalStyles = GlobalStyles(theme);

  // Add the reset hook
  useKioskReset();

  const { workingHours } = useAppSelector((state) => state.kioskSettings.kioskSettings);

  const formatWorkingHours = (start: string, end: string): string => {
    const formatTime = (time: string): string => {
      if (!/^(\d{2}):(\d{2}):(\d{2})$/.test(time)) {
        return 'Invalid time';
      }
      const [hours, minutes, seconds] = time.split(':');
      const date = new Date();
      date.setHours(parseInt(hours, 10));
      date.setMinutes(parseInt(minutes, 10));
      date.setSeconds(parseInt(seconds, 10));
      return date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    if (start === '00:00:00' && end === '00:00:00') {
      return 'Closed';
    }

    return `${formatTime(start)} - ${formatTime(end)}`;
  };

  const currentDay = new Date().getDay();
  const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

  const reorderedDays = [
    daysOfWeek[currentDay],
    ...daysOfWeek.slice(0, currentDay),
    ...daysOfWeek.slice(currentDay + 1)
  ];

  return (
    <Box
      sx={{
        backgroundImage: `url(${UserWelcomeBanner})`,
        ...globalStyles.pageContainer
      }}
    >
      <Container
        sx={{
          width: '535px',
          height: '529px',
          ...globalStyles.pageContentContainer
        }}
      >
        <Box component="img" src={OriflameLogo} sx={{ width: '262px' }} />
        <Typography
          variant="body1"
          sx={{ fontWeight: 400, fontSize: '1.625rem', lineHeight: '28.8px' }}
        >
          Currently, we are out of working hours
        </Typography>

        <Typography
          variant="body1"
          sx={{
            fontSize: '1.5rem',
            marginTop: '20px'
          }}
        >
          Working Hours
        </Typography>

        <Box
          sx={{
            marginTop: '20px',
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gridTemplateRows: 'repeat(3, 1fr)',
            gap: '15px',
            justifyItems: 'center'
          }}
        >
          {reorderedDays.map((day, index) => {
            const isCurrentDay = day === daysOfWeek[currentDay];
            const { start, end } = workingHours[day];
            return (
              <Box
                key={day}
                sx={{
                  width: '235px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 8px 10px 8px',
                  borderRadius: '8px',
                  backgroundColor: isCurrentDay
                    ? theme.palette.success.main
                    : theme.palette.common.white,
                  gridColumn: index === 0 ? '1 / span 2' : 'auto'
                }}
              >
                <Typography
                  variant="body1"
                  sx={{
                    fontWeight: 700,
                    color: isCurrentDay ? theme.palette.primary.light : ''
                  }}
                >
                  {day.charAt(0).toUpperCase() + day.slice(1)}
                </Typography>
                <Typography
                  variant="body2"
                  fontSize={13}
                  sx={{
                    color: isCurrentDay ? theme.palette.primary.light : ''
                  }}
                >
                  {start === '00:00:00' && end === '00:00:00'
                    ? 'Closed'
                    : formatWorkingHours(start, end)}
                </Typography>
              </Box>
            );
          })}
        </Box>
      </Container>
    </Box>
  );
}

export default NonWorkingHours;
