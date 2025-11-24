import { CircularProgress } from '@mui/material';
import { Box } from '@mui/system';
import { JSX } from 'react';

function LoadingIndicator({ loading }: { loading: boolean }): JSX.Element | null {
  if (loading)
    return (
      <Box
        sx={{
          width: '100%',
          height: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <CircularProgress size={25} />
      </Box>
    );
  return null;
}
export default LoadingIndicator;
