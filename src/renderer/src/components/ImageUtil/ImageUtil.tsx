import { ImageObjectBase } from '@/interfaces/modal';
import { ImageUtilsProps } from '@/interfaces/props';
import { getData } from '@/services/axiosWrapper/apiService';
import { getProductImageEndPoint } from '@/utils/endpoints';
import { CircularProgress, Typography, Box } from '@mui/material';
import { useEffect, useState } from 'react';

function ImageUtils(props: ImageUtilsProps) {
  const { skuCode, imgHeight, containerHeight, containerWidth } = props;
  const [image, setImage] = useState<ImageObjectBase | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setLoading(true);

    getData<ImageObjectBase>(`${getProductImageEndPoint}/${skuCode}`)
      .then((response) => {
        setImage(response);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [skuCode]);

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: containerHeight,
          maxHeight: '100%',
          minWidth: containerWidth
        }}
      >
        <CircularProgress color="primary" />
      </Box>
    );
  }

  if (image && image.mimeType) {
    return (
      <img
        src={image.pictureUrl}
        alt=""
        style={{
          height: imgHeight
        }}
      />
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: containerHeight,
        minWidth: containerWidth
      }}
    >
      <Typography variant="h5">No Image...</Typography>
    </Box>
  );
}

export default ImageUtils;
