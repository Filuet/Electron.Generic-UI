import { GlobalStyles } from '@/globalStyles/globalStyles';
import { Typography, useTheme } from '@mui/material';
import { Box, Container } from '@mui/system';
import PaymentPageBanner from '../../../assets/images/Banners/Kiosk_Welcome_Page_Banner.jpg';
import OriflameLogo from '../../../assets/images/Logo/Oriflame_logo_WelcomePage.png';
import { CancelPaymentStyles } from './cancelPaymentStyles';

function CancelPayment() {
  const theme = useTheme();
  const globalStyles = GlobalStyles(theme);
  const cancelPaymentStyle = CancelPaymentStyles();
  return (
    <Box
      sx={{
        backgroundImage: `url(${PaymentPageBanner})`,
        ...globalStyles.pageContainer
      }}
    >
      <Container
        sx={{
          width: '535px',
          height: '482px',
          ...globalStyles.pageContentContainer
        }}
      >
        <Box component="img" src={OriflameLogo} sx={{ width: '262px' }} />
        <Typography variant="body1" sx={cancelPaymentStyle.cancelPaymentHeader}>
          Your payment has been cancelled
        </Typography>

        <Box sx={cancelPaymentStyle.paymentInformationContainer}>
          <Box>
            <Typography variant="body2" sx={cancelPaymentStyle.informationText}>
              Amount:
            </Typography>
            <Typography variant="body2" sx={cancelPaymentStyle.informationText}>
              Date
            </Typography>
            <Typography variant="body2" sx={cancelPaymentStyle.informationText}>
              Customer info:
            </Typography>
            <Typography variant="body2" sx={cancelPaymentStyle.informationText}>
              State:
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" sx={cancelPaymentStyle.informationText}>
              1000
            </Typography>
            <Typography variant="body2" sx={cancelPaymentStyle.informationText}>
              2/02/2028 10:00 PM
            </Typography>
            <Typography variant="body2" sx={cancelPaymentStyle.informationText}>
              Igor Gustaiev
            </Typography>
            <Typography variant="body2" sx={cancelPaymentStyle.informationText}>
              Cancelled
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
export default CancelPayment;
