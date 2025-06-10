import { Button, Modal, Typography, useTheme } from '@mui/material';
import { Box } from '@mui/system';
import { OriflameModalProps } from '@/interfaces/props';
import OriflameLogo from '../../assets/images/Logo/oriflameLogo.svg';

function OriflameModal(oriflameModalProps: OriflameModalProps) {
  const { content, isModalOpen, onCloseModal } = oriflameModalProps;
  const theme = useTheme();
  return (
    <Modal open={isModalOpen} onClose={onCloseModal}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          borderRadius: 2,
          backgroundColor: theme.palette.background.paper,
          padding: '30px 60px 30px 60px',
          boxShadow: 'none'
        }}
      >
        <Box component="img" src={OriflameLogo} sx={{ width: '250px', marginBottom: '30px' }} />

        <Typography
          variant="body1"
          sx={{
            fontSize: '22px',
            width: '320px'
          }}
        >
          {content}
        </Typography>
        <Box
          sx={{
            marginTop: '48px',
            display: 'flex',
            justifyContent: 'space-around'
          }}
        >
          <Button
            variant="contained"
            sx={{
              width: '5rem',
              fontWeight: 'bold',
              color: theme.palette.primary.main,
              backgroundColor: theme.palette.secondary.main
            }}
            onClick={onCloseModal}
          >
            OK
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}
export default OriflameModal;
