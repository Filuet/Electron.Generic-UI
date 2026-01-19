import { Card, CardContent, Typography, Button, IconButton, useTheme, Dialog } from '@mui/material';
import RemoveIcon from '@mui/icons-material/Remove';
import AddIcon from '@mui/icons-material/Add';
import { Box, Stack } from '@mui/system';
import CancelIcon from '@mui/icons-material/Cancel';
import useTranslationHook from '@/localization/hook';
import { useAppDispatch, useAppSelector } from '@/redux/core/utils/reduxHook';
import { addToCart, decrementProduct, removeProduct } from '@/redux/features/cart/cartSlice';
import { JSX, useState } from 'react';
import { ClientType, ProductDataModal } from '@/interfaces/modal';
import { validateAddToCart } from '@/utils/cartValidationUtils';
import NewProductTag from '../../assets/images/tags/NewTag.png';
import IconicProduct from '../../assets/images/tags/iconic_product_symbol.png';
import { ProductCardStyles } from './productCardStyle';
import ImageUtils from '../ImageUtil/ImageUtil';
import OriflameModal from '../oriflameModalUtils/OriflameModal';
import MultipleImageUtil from '../ImageUtil/MultipleImageUtil';

function ProductCard({ product }: { product: ProductDataModal }): JSX.Element {
  const theme = useTheme();
  const productCardStyle = ProductCardStyles(theme);
  const { translate } = useTranslationHook();
  const dispatch = useAppDispatch();
  const currentClient = useAppSelector((state) => state.customerLogin.clientType);

  const [isDescriptionDialogOpen, setIsDescriptionDialogOpen] = useState<boolean>(false);
  const [productLimitDialogContent, setProductLimitDialogContent] = useState<string>('');
  const [showProductLimitDialog, setShowProductLimitDialog] = useState<boolean>(false);
  let sellingPrice = product.sellingPriceVIP;
  let bonusPoints: number = 0;
  if (ClientType.BrandPartner === currentClient) {
    sellingPrice = product.sellingPriceBRP;
    bonusPoints = product.bP_BRP;
  }
  const cart = useAppSelector((state) => state.cart);
  const productInCart = cart.products.find((item) => item.skuCode === product.skuCode);
  const { customerOrderDetails } = useAppSelector((state) => state.customerOrderDetails);

  const onAddToCart = (): void => {
    const validationMessage = validateAddToCart(
      product,
      productInCart,
      customerOrderDetails,
      cart.totalPrice,
      currentClient
    );

    if (validationMessage) {
      setShowProductLimitDialog(true);
      setProductLimitDialogContent(validationMessage);
      return;
    }

    dispatch(
      addToCart({
        productCount: 1,
        productName: product.productName,
        price: product.price,
        skuCode: product.skuCode,
        quantity: product.quantity,
        bP_BRP: product.bP_BRP,
        fillSize: product.fillSize,
        fillUnit: product.fillUnit,
        sellingPriceVIP: product.sellingPriceVIP,
        sellingPriceBRP: product.sellingPriceBRP,
        priceToAdd: sellingPrice
      })
    );
  };

  const handleDecrement = (): void => {
    if (productInCart && productInCart.productCount > 1) {
      dispatch(decrementProduct(product.skuCode));
    } else if (productInCart?.productCount === 1) {
      dispatch(removeProduct(product.skuCode));
    }
  };

  let currentProductTag: string = NewProductTag;
  let tagImageSize = '3rem';
  if (product.productTag.toUpperCase() === 'ICON') {
    currentProductTag = IconicProduct;
    tagImageSize = '25px';
  }

  const onCloseProductLimitModal = (): void => {
    setShowProductLimitDialog(false);
  };

  return (
    <>
      <Card sx={productCardStyle.cardStyle}>
        <Box sx={{ position: 'relative' }}>
          {product.productTag && (
            <Box
              component="img"
              src={currentProductTag}
              sx={{
                ...productCardStyle.productTagImageStyle,
                width: tagImageSize
              }}
            />
          )}
          <Box
            sx={{
              height: '175px'
            }}
            onClick={() => setIsDescriptionDialogOpen(true)}
          >
            <ImageUtils
              skuCode={product.skuCode}
              imgHeight="175px"
              containerHeight="175px"
              containerWidth="175px"
            />
          </Box>
        </Box>

        <CardContent sx={productCardStyle.cardContent}>
          <Box sx={productCardStyle.cardInfoContainer}>
            <Typography variant="body1" sx={productCardStyle.productName}>
              {product.productName}
            </Typography>

            <Box sx={productCardStyle.stackInfoContainer}>
              <Typography variant="body1" sx={productCardStyle.cardSku}>
                {product.skuCode}
              </Typography>
              <Typography variant="body1" sx={productCardStyle.fillSize}>
                {product.fillSize} {product.fillUnit}.
              </Typography>
              {ClientType.BrandPartner === currentClient && (
                <Typography variant="body1" sx={productCardStyle.bonusPoint}>
                  {`${bonusPoints} Bonus points`}
                </Typography>
              )}
            </Box>

            <Stack direction="column" textAlign="left">
              <Typography variant="body1" sx={productCardStyle.originalPrice} color="error">
                Rs {sellingPrice}
              </Typography>
              <Typography variant="body1" sx={{ fontSize: '8px', marginTop: '4px' }}>
                MRP{' '}
                <span
                  style={{
                    textDecoration: 'line-through'
                  }}
                >
                  {`Rs ${product.price}`}
                </span>
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  fontSize: '10px',
                  marginTop: '2px'
                }}
              >
                Inclusive of all taxes
              </Typography>
            </Stack>
          </Box>

          {productInCart ? (
            <Box
              sx={{
                ...productCardStyle.iconContainer
              }}
            >
              <IconButton onClick={handleDecrement}>
                <RemoveIcon sx={productCardStyle.quantityControllerIcon} />
              </IconButton>
              <Box sx={productCardStyle.quantityContainer}>{productInCart.productCount}</Box>
              <IconButton onClick={onAddToCart}>
                <AddIcon sx={productCardStyle.quantityControllerIcon} />
              </IconButton>
            </Box>
          ) : (
            <Button variant="contained" sx={productCardStyle.addToCartButton} onClick={onAddToCart}>
              {translate('addToCart')}
            </Button>
          )}
        </CardContent>
      </Card>
      <Dialog
        key={product.skuCode}
        open={isDescriptionDialogOpen}
        onClose={() => setIsDescriptionDialogOpen(false)}
        sx={productCardStyle.descriptionDialogue}
      >
        <Box sx={productCardStyle.dialogIconContainer}>
          <IconButton onClick={() => setIsDescriptionDialogOpen(false)}>
            <CancelIcon
              sx={{
                backgroundColor: theme.palette.common.white,
                color: theme.palette.common.black,
                fontSize: '30px'
              }}
            />
          </IconButton>
        </Box>
        <Box sx={{ display: 'flex' }}>
          <Box sx={{ width: '250px', height: '250px' }}>
            <Box sx={{ position: 'relative' }}>
              {product.productTag && (
                <Box
                  component="img"
                  src={currentProductTag}
                  sx={{
                    ...productCardStyle.productTagImageStyle,
                    width: tagImageSize
                  }}
                />
              )}
              <Box>
                <MultipleImageUtil
                  skuCode={product.skuCode}
                  imgHeight="250px"
                  containerHeight="250px"
                  containerWidth="250px"
                />
              </Box>
            </Box>
          </Box>

          <Box sx={productCardStyle.descriptionTextContainer}>
            <Box sx={{ minHeight: '202px' }}>
              <Typography variant="body1" sx={{ fontSize: '1.6rem', lineHeight: '30px' }}>
                {product.productName}
              </Typography>
              <Stack flexDirection="row" mt={2} gap={1} alignItems="center">
                <Typography
                  variant="body1"
                  sx={{
                    fontWeight: 400,
                    fontSize: '15px',
                    lineHeight: '9px'
                  }}
                >
                  {product.skuCode}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    fontWeight: 400,
                    fontSize: '15px',
                    lineHeight: '9px'
                  }}
                >
                  {product.fillSize} {product.fillUnit}
                </Typography>
                {ClientType.BrandPartner === currentClient && (
                  <Typography
                    variant="body1"
                    sx={{
                      fontWeight: 400,
                      fontSize: '15px',
                      lineHeight: '9px'
                    }}
                  >
                    {`${bonusPoints} Bonus points`}
                  </Typography>
                )}
              </Stack>
              <Stack direction="row" mt={2} mb="10px" alignItems="center" gap={1}>
                <Typography
                  variant="body1"
                  sx={{
                    fontSize: '17px',
                    lineHeight: '13.2px',
                    fontWeight: 'bold'
                  }}
                  color="error"
                >
                  Rs {sellingPrice}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    fontSize: '10px'
                  }}
                >
                  MRP{' '}
                  <span
                    style={{
                      textDecoration: 'line-through'
                    }}
                  >
                    {`Rs ${product.price}`}
                  </span>
                </Typography>
              </Stack>
              <Typography
                variant="body1"
                component="div"
                sx={{
                  lineHeight: '10px',
                  fontSize: '13px',
                  marginTop: '14px',
                  marginBottom: '13px'
                }}
              >
                Inclusive of all taxes
              </Typography>
              {productInCart ? (
                <Box
                  sx={{
                    width: '130px',
                    display: 'flex',
                    justifyContent: 'space-evenly',
                    alignItems: 'center',
                    marginTop: '20px'
                  }}
                >
                  <IconButton onClick={handleDecrement}>
                    <RemoveIcon
                      sx={{
                        width: '1.5rem',
                        height: '1.5rem',
                        color: theme.palette.common.white,
                        backgroundColor: theme.palette.common.black,
                        borderRadius: '50%'
                      }}
                    />
                  </IconButton>
                  <Box
                    sx={{
                      width: '2.3rem',
                      height: '2.3rem',
                      color: theme.palette.common.white,
                      backgroundColor: theme.palette.common.black,
                      borderRadius: '3rem',
                      display: 'flex',
                      alignItems: 'center',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      fontWeight: 400,
                      fontSize: '20px',
                      fontFamily: 'SansOri,sans-serif'
                    }}
                  >
                    {productInCart.productCount}
                  </Box>
                  <IconButton onClick={onAddToCart}>
                    <AddIcon
                      sx={{
                        width: '1.5rem',
                        height: '1.5rem',
                        color: theme.palette.common.white,
                        backgroundColor: theme.palette.common.black,
                        borderRadius: '50%'
                      }}
                    />
                  </IconButton>
                </Box>
              ) : (
                <Button
                  variant="contained"
                  sx={{
                    width: '6.7rem',
                    height: '2rem',
                    borderRadius: '4rem',
                    fontWeight: 400,
                    letterSpacing: '0.5px',
                    fontSize: '12px',
                    lineHeight: '8.4px',
                    padding: 0,
                    boxShadow: 'none',
                    marginTop: '10px'
                  }}
                  onClick={onAddToCart}
                >
                  {translate('addToCart')}
                </Button>
              )}
            </Box>

            <Typography variant="body1" sx={productCardStyle.descriptionText}>
              Description
            </Typography>
            <Box sx={productCardStyle.descriptionScroll}>
              <Typography
                variant="body1"
                component="div"
                sx={{ paddingRight: '8px' }}
                dangerouslySetInnerHTML={{ __html: product.productDescription }}
              />
            </Box>
          </Box>
        </Box>
      </Dialog>

      <OriflameModal
        content={productLimitDialogContent}
        onCloseModal={onCloseProductLimitModal}
        isModalOpen={showProductLimitDialog}
      />
    </>
  );
}

export default ProductCard;
