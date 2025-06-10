import { JSX, useEffect, useState } from 'react';
import { NewImageObject } from '@/interfaces/modal';
import { ImageUtilsProps } from '@/interfaces/props';
import { getData } from '@/services/axiosWrapper/apiService';
import { getProductImagesEndPoint } from '@/utils/endpoints';
import { Box, Typography, IconButton, Dialog, useTheme, Fade, Skeleton } from '@mui/material';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import CancelIcon from '@mui/icons-material/Cancel';

function MultipleImageUtil(props: ImageUtilsProps): JSX.Element {
  const { skuCode, imgHeight, containerHeight, containerWidth } = props;
  const theme = useTheme();
  const [images, setImages] = useState<NewImageObject[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);
  const [fadeIn, setFadeIn] = useState<boolean>(true);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);

  useEffect(() => {
    setLoading(true);
    getData<NewImageObject[]>(`${getProductImagesEndPoint}/${skuCode}`)
      .then((response) => {
        setImages(response);
        setSelectedImageIndex(0);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [skuCode]);

  const onThumbnailClick = (index: number) => {
    if (index !== selectedImageIndex) {
      setFadeIn(false);
      setTimeout(() => {
        setSelectedImageIndex(index);
        setFadeIn(true);
      }, 100);
    }
  };

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.touches[0].clientX);
  };

  const onTouchEnd = () => {
    if (touchStartX === null || touchEndX === null) return;

    const diff = touchStartX - touchEndX;
    const minSwipeDistance = 50;

    if (diff > minSwipeDistance) {
      setSelectedImageIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1));
    } else if (diff < -minSwipeDistance) {
      setSelectedImageIndex((prevIndex) => (prevIndex === 0 ? images.length - 1 : prevIndex - 1));
    }

    setTouchStartX(null);
    setTouchEndX(null);
  };

  if (loading) {
    return (
      <Box>
        <Skeleton
          variant="rectangular"
          width={containerWidth}
          height={imgHeight}
          sx={{ borderRadius: 2 }}
        />

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            gap: 2,
            margin: '1rem'
          }}
        >
          {[1, 2, 3].map((key) => (
            <Skeleton
              key={key}
              variant="rectangular"
              width="3.5rem"
              height="3.5rem"
              sx={{ borderRadius: 1 }}
            />
          ))}
        </Box>

        <Skeleton variant="text" width="60%" height={30} sx={{ margin: 'auto' }} />
      </Box>
    );
  }

  if (!images.length || !images[0].mimeType) {
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
        <Typography variant="h5">No Image Available</Typography>
      </Box>
    );
  }

  return (
    <>
      <Box
        sx={{
          width: containerWidth,
          position: 'relative'
        }}
      >
        <IconButton
          sx={{
            position: 'absolute',
            top: '10px',
            right: '10px'
          }}
          onClick={() => setIsFullScreen(true)}
        >
          <FullscreenIcon />
        </IconButton>
        <Box onClick={() => setIsFullScreen(true)}>
          <Fade in={fadeIn} timeout={400}>
            <img
              src={images[selectedImageIndex].pictureUrl}
              alt={`Product ${selectedImageIndex + 1}`}
              style={{
                height: imgHeight,
                touchAction: 'pan-y'
              }}
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            />
          </Fade>
        </Box>

        <Box
          sx={{
            display: 'flex',
            overflowX: 'auto',
            gap: '0.8rem',
            justifyContent: 'center',
            padding: '0.4rem',
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': {
              display: 'none'
            }
          }}
        >
          {images.map((img, index) => (
            <Box
              key={img.pictureUid}
              component="img"
              src={img.pictureUrl}
              alt={`Thumbnail ${index}`}
              onClick={() => onThumbnailClick(index)}
              sx={{
                width: '3.5rem',
                height: '3.5rem',
                borderRadius: '0.4rem',
                cursor: 'pointer',
                padding: '0.3rem',
                border:
                  index === selectedImageIndex ? `1px solid ${theme.palette.divider}` : 'none',
                boxShadow: index === selectedImageIndex ? 'none' : theme.shadows[1],
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  transform: 'scale(1.05)'
                }
              }}
            />
          ))}
        </Box>

        <Typography
          variant="body1"
          sx={{
            textDecoration: 'underline',
            textAlign: 'center',
            fontSize: '18px',
            marginTop: '0.4rem',
            cursor: 'pointer'
          }}
          onClick={() => setIsFullScreen(true)}
        >
          Click to zoom
        </Typography>
      </Box>
      <Dialog
        open={isFullScreen}
        onClose={() => setIsFullScreen(false)}
        fullWidth
        maxWidth="md"
        slotProps={{
          paper: {
            sx: {
              width: '50rem',
              height: '50rem'
            }
          }
        }}
      >
        <IconButton
          sx={{
            position: 'absolute',
            top: '10px',
            right: '10px'
          }}
          onClick={() => setIsFullScreen(false)}
        >
          <CancelIcon fontSize="large" />
        </IconButton>

        <Fade in timeout={300}>
          <img
            src={images[selectedImageIndex].pictureUrl}
            alt={`Product ${selectedImageIndex + 1}`}
            style={{
              height: '100%',
              touchAction: 'pan-y'
            }}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          />
        </Fade>
      </Dialog>
    </>
  );
}

export default MultipleImageUtil;
