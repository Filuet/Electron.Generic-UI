import { Box } from '@mui/system';

function NoDataUtils({ status }: { status: boolean }) {
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
