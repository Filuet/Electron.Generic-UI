import { Box, Stack } from '@mui/system';
import LocalMallOutlinedIcon from '@mui/icons-material/LocalMallOutlined';
import { Button, IconButton, Typography, useTheme } from '@mui/material';
import CancelIcon from '@mui/icons-material/Cancel';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import RemoveIcon from '@mui/icons-material/Remove';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';
import { ClientType, PageRoute } from '@/interfaces/modal';
import { useAppDispatch, useAppSelector } from '@/redux/core/utils/reduxHook';
import ImageUtils from '@/components/ImageUtil/ImageUtil';
import { addToCart, decrementProduct, removeProduct } from '@/redux/features/cart/cartSlice';
import { ProductCartPageProps } from '@/interfaces/props';
import { JSX, useEffect, useRef, useState } from 'react';
import { CartProduct } from '@/redux/features/cart/cartTypes';
import ProductCard from '@/components/productCard/ProductCard';
import OriflameModal from '@/components/oriflameModalUtils/OriflameModal';
import { setActivePage } from '@/redux/features/pageNavigation/navigationSlice';
import { validateAddToCart } from '@/utils/cartValidationUtils';
import { ProductCartStyles } from './productCartStyles';

function ProductCart(props: ProductCartPageProps): JSX.Element {
  const { onCheckoutPageClose, productSuggestionList } = props;
  const theme = useTheme();
  const cartStyles = ProductCartStyles(theme);
  const dispatch = useAppDispatch();
  const currentClient = useAppSelector((state) => state.customerLogin.clientType);
  const { products, totalPrice } = useAppSelector((state) => state.cart);
  const { customerOrderDetails } = useAppSelector((state) => state.customerOrderDetails);
  const [showCartLimitDialog, setShowProductLimitDialog] = useState<boolean>(false);
  const [productCartLimitDialogContent, setProductLimitDialogContent] = useState<string>('');
  const [totalBonusPoints, setTotalBonusPoints] = useState<number>(0);
  const [showLeftIcon, setShowLeftIcon] = useState(false);
  const [showRightIcon, setShowRightIcon] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const onProductCardScroll = (direction: 'left' | 'right'): void => {
    if (containerRef.current) {
      const scrollAmount = direction === 'left' ? -167 : 167;
      containerRef.current.scrollBy({
        left: scrollAmount,
        behavior: 'smooth'
      });
    }
  };
  const checkScrollIcons = (): void => {
    if (containerRef.current) {
      const isAtLeftEnd = containerRef.current.scrollLeft === 0;
      const isAtRightEnd =
        Math.abs(
          containerRef.current.scrollLeft +
          containerRef.current.clientWidth -
          containerRef.current.scrollWidth
        ) < 1;

      setShowLeftIcon(!isAtLeftEnd);
      setShowRightIcon(!isAtRightEnd);
    }
  };

  useEffect(() => {
    const onWindowResize = (): void => {
      checkScrollIcons();
    };
    window.addEventListener('resize', onWindowResize);
    checkScrollIcons();
    return () => {
      window.removeEventListener('resize', onWindowResize);
    };
  }, []);
  useEffect(() => {
    const calculateTotalBPPoints = (): void => {
      const totalBP = products.reduce((acc, product) => {
        return acc + product.bP_BRP * product.productCount;
      }, 0);
      setTotalBonusPoints(totalBP);
    };
    calculateTotalBPPoints();
  }, [products]);
  const filteredProductSuggestions = productSuggestionList.filter(
    (productSuggestion) =>
      !products.some((cartProduct) => cartProduct.skuCode === productSuggestion.skuCode)
  );

  const onCloseModal = (): void => {
    setShowProductLimitDialog(false);
  };

  const onAddToCart = (product: CartProduct): void => {
    const productInCart = products.find((item) => item.skuCode === product.skuCode);

    const validationMessage = validateAddToCart(
      product,
      productInCart,
      customerOrderDetails,
      totalPrice,
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
        priceToAdd:
          ClientType.BrandPartner === currentClient
            ? product.sellingPriceBRP
            : product.sellingPriceVIP
      })
    );
  };

  const onPaymentPage = (): void => {
    dispatch(setActivePage(PageRoute.PaymentProcessingPage));
  };

  return (
    <>
      <Box sx={cartStyles.cartHeaderContainer}>
        <Stack flexDirection="row" gap={1}>
          <LocalMallOutlinedIcon sx={{ fontSize: '1.875rem' }} />
          <Typography variant="body1" sx={cartStyles.myBagText}>
            My Bag
          </Typography>
        </Stack>
        <IconButton onClick={onCheckoutPageClose}>
          <CancelIcon
            sx={{
              backgroundColor: theme.palette.common.white,
              color: theme.palette.common.black,
              fontSize: '1.875rem'
            }}
          />
        </IconButton>
      </Box>
      <Box
        sx={{
          marginTop: '55px',
          display: 'flex',
          justifyContent: 'space-between',
          padding: '0px 20px 0px 10px'
        }}
      >
        <Box
          sx={{
            width: '445px',
            maxHeight: '550px',
            overflowY: 'auto',
            scrollbarWidth: 'thin'
          }}
        >
          {products.map((product) => (
            <Box
              key={product.skuCode}
              sx={{
                width: '420px',
                height: '133px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '10px'
              }}
            >
              <ImageUtils
                skuCode={product.skuCode}
                imgHeight="130px"
                containerHeight="100px"
                containerWidth="100px"
              />

              {/* <img
                src="
              https://media-cdn.oriflame.com/productImage?externalMediaId=product-management-media%2FProducts%2F43687%2FIN%2F43687_1.png&id=19437733&version=1&w=750&bc=%23f5f5f5&ib=%23f5f5f5&q=90&imageFormat=WebP
            "
                style={{ width: '130px' }}
                alt=""
              /> */}

              <Box sx={cartStyles.cartProductContentContainer}>
                <Typography sx={cartStyles.cartProductName}>{product.productName}</Typography>
                <Stack flexDirection="row" gap={1} alignItems="center">
                  <Typography variant="body1" sx={cartStyles.productStackInformation}>
                    {product.skuCode}
                  </Typography>
                  <Typography variant="body1" sx={cartStyles.productStackInformation}>
                    {product.fillSize} {product.fillUnit}
                  </Typography>
                  {ClientType.BrandPartner === currentClient && (
                    <Typography
                      variant="body1"
                      sx={cartStyles.productStackInformation}
                    >{`${product.bP_BRP} Bonus points`}</Typography>
                  )}
                </Stack>
                <Typography variant="body1">
                  <Typography
                    style={{
                      color: theme.palette.error.main,
                      fontWeight: 700,
                      fontSize: '0.875rem'
                    }}
                    component="span"
                  >
                    {ClientType.BrandPartner === currentClient
                      ? `Total Rs ${product.sellingPriceBRP * product.productCount}`
                      : `Total Rs ${product.sellingPriceVIP * product.productCount}`}
                  </Typography>{' '}
                  <Typography
                    style={{
                      ...cartStyles.MRPStyles,
                      verticalAlign: '10%'
                    }}
                    component="span"
                  >
                    {ClientType.BrandPartner === currentClient
                      ? `(Rs ${product.sellingPriceBRP}/unit)`
                      : `(Rs ${product.sellingPriceVIP}/unit)`}
                  </Typography>
                </Typography>

                <Typography variant="body1" sx={cartStyles.MRPStyles}>
                  MRP{' '}
                  <Typography
                    style={{
                      textDecoration: 'line-through'
                    }}
                    sx={cartStyles.MRPStyles}
                    component="span"
                  >
                    {`Rs ${product.price}`}
                  </Typography>
                </Typography>
                <Typography variant="body1" sx={cartStyles.priceHelperText}>
                  Inclusive of all taxes
                </Typography>
              </Box>
              <Box sx={cartStyles.quantityControllerContainer}>
                <IconButton
                  onClick={() => {
                    if (product.productCount > 1) {
                      dispatch(decrementProduct(product.skuCode));
                    } else if (product.productCount === 1) {
                      dispatch(removeProduct(product.skuCode));
                    }
                  }}
                >
                  <RemoveIcon sx={cartStyles.removeIcon} />
                </IconButton>
                <Box sx={cartStyles.productCountStyle}>{product.productCount}</Box>

                <IconButton
                  onClick={() => {
                    onAddToCart(product);
                  }}
                >
                  <AddIcon sx={cartStyles.addIcon} />
                </IconButton>
              </Box>
            </Box>
          ))}
        </Box>
        <Box>
          <Box
            sx={{
              ...cartStyles.priceDetailsContainer,
              height: currentClient === ClientType.BrandPartner ? '120px' : '90px'
            }}
          >
            <Typography variant="body1" sx={cartStyles.priceDetailsText}>
              Price Details
            </Typography>
            <Typography variant="body1" sx={{ fontSize: '1.125rem', marginTop: '8px' }}>
              Your Total is: Rs {totalPrice}
            </Typography>

            {/* <Typography
              variant="body1"
              sx={{ fontSize: '18px', marginTop: '8px' }}
            >
              Total MRP: Rs {totalPrice + totalBonusPoints}
            </Typography> */}
            {currentClient === ClientType.BrandPartner && (
              <Typography variant="body1" sx={{ fontSize: '1.125rem', marginTop: '8px' }}>
                Total BP points: {totalBonusPoints}
              </Typography>
            )}
          </Box>
          <Button
            variant="outlined"
            onClick={onPaymentPage}
            sx={{
              width: '7.9rem',
              height: '2.6rem',
              marginTop: '20px',
              marginLeft: '100px',
              fontSize: '1.3125rem',
              textTransform: 'none'
            }}
          >
            Check out
          </Button>
        </Box>
      </Box>

      <Box sx={{ margin: 'auto' }}>
        {filteredProductSuggestions.length > 0 && (
          <Typography
            variant="body1"
            sx={{
              textAlign: 'left',
              marginLeft: '100px',
              fontSize: '1.125rem',
              fontWeight: 400,
              marginTop: '40px'
              // marginBottom: '15px',
            }}
          >
            You may also like:
          </Typography>
        )}
        <Box
          sx={{
            display: 'flex',
            borderRadius: '0.5rem',
            width: '90%',
            margin: 'auto',
            flexDirection: 'row',
            alignItems: 'center'
          }}
        >
          <Box sx={{ width: '42px' }}>
            {showLeftIcon && (
              <IconButton onClick={() => onProductCardScroll('left')} sx={{}}>
                <ArrowBackOutlinedIcon
                  sx={{
                    fontSize: '2.625rem',
                    border: `1px solid ${theme.palette.primary.light}`,
                    borderRadius: '50%'
                  }}
                />
              </IconButton>
            )}
          </Box>
          <Box
            ref={containerRef}
            sx={{
              display: 'flex',
              gap: '13px',
              margin: 'auto',
              minWidth: '535px',
              maxWidth: '540px',
              paddingTop: '10px',
              paddingBottom: '10px',
              overflowX: 'auto',
              scrollbarWidth: 'none',
              '&::-webkit-scrollbar': {
                display: 'none'
              }
            }}
            onScroll={checkScrollIcons}
          >
            {filteredProductSuggestions.map((product) => (
              <Box key={product.skuCode} sx={{ width: '167px', minWidth: '167px' }}>
                <ProductCard key={product.skuCode} product={product} />
              </Box>
            ))}
          </Box>

          <Box sx={{ width: '42px' }}>
            {showRightIcon && (
              <IconButton onClick={() => onProductCardScroll('right')} sx={{}}>
                <ArrowForwardRoundedIcon
                  sx={{
                    fontSize: '2.625rem',
                    fontWeight: 400,
                    border: `1px solid ${theme.palette.primary.light}`,
                    borderRadius: '50%'
                  }}
                />
              </IconButton>
            )}
          </Box>
        </Box>
      </Box>
      <OriflameModal
        isModalOpen={showCartLimitDialog}
        content={productCartLimitDialogContent}
        onCloseModal={onCloseModal}
      />
    </>
  );
}

export default ProductCart;
