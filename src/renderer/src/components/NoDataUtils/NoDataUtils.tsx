import { Box } from '@mui/system';
import { JSX } from 'react';

function NoDataUtils({ status }: { status: boolean }): JSX.Element | null {
  if (status)
    return (
      <Box
        sx={{
          width: '100%',
          height: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          fontSize: '1rem',
          textAlign: 'center'
        }}
      >
        No product found ....
      </Box>
    );
  return null;
}

export default NoDataUtils;
