import { JSX, useEffect, useState } from 'react';
import Navbar from '@/components/NavBar/NavBar';
import {
  Divider,
  IconButton,
  InputAdornment,
  ListItemText,
  MenuItem,
  MenuList,
  TextField,
  Tooltip,
  Typography,
  useTheme
} from '@mui/material';
import { Box, Stack } from '@mui/system';
import LocalMallOutlinedIcon from '@mui/icons-material/LocalMallOutlined';
import ClearIcon from '@mui/icons-material/Clear';
import { Search } from '@mui/icons-material';
import Badge from '@mui/material/Badge';
import useTranslationHook from '@/localization/hook';
import NoDataUtils from '@/components/NoDataUtils/NoDataUtils';
import ProductCard from '@/components/productCard/ProductCard';
import { ProductDataModal, Category, PogRoute, LogLevel } from '@/interfaces/modal';
import { getData } from '@/services/axiosWrapper/apiService';
import {
  oriflameProductApi,
  oriflameCategoriesApi,
  planogramJsonEndpoint
} from '@/utils/endpoints';
import { useAppSelector } from '@/redux/core/utils/reduxHook';
import OriflameLoader from '@/components/oriflameLoader/OriflameLoader';
import { updatePlanogramJson } from '@/utils/expoApiUtils';

import ProductCart from '../ProductCartPage/ProductCart';
import { HomePageStyles } from './homePageStyle';
import CategoryBanner from '../../assets/images/Banners/CategoryBanner.png';
import { ProductPageStyles } from './productPageStyles';
import HomePageBanner from '../../assets/images/Banners/TopHomePageBanner.png';
import loggingService from '@/utils/loggingService';

function HomePage(): JSX.Element {
  const theme = useTheme();
  const homePageStyles = HomePageStyles();
  const [productSearchText, setProductSearchText] = useState('');
  const { translate } = useTranslationHook();
  const [isProductCartOpen, setIsProductCartOpen] = useState<boolean>(false);
  const [productSuggestions, setProductSuggestion] = useState<ProductDataModal[]>([]);

  const [categories, setCategories] = useState<string[]>([]);
  const [productData, setProductData] = useState<ProductDataModal[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const productPageStyle = ProductPageStyles(theme);
  const [loading, setLoading] = useState(true);
  const productCount = useAppSelector((state) => state.cart.totalCount);
  const shouldOpenCart = useAppSelector((state) => state.navigation.isCartOpen);
  useEffect(() => {
    if (productCount === 0) {
      setIsProductCartOpen(false);
    }
  }, [productCount]);
  useEffect(() => {
    if (shouldOpenCart) {
      setIsProductCartOpen(true);
    }
  }, [shouldOpenCart]);
  const onProductSearchChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setProductSearchText(event.target.value);
  };
  const onCloseProductCartPage = (): void => {
    setIsProductCartOpen(false);
  };
  useEffect(() => {
    const kioskName = import.meta.env.VITE_KIOSK_NAME;
    getData<PogRoute[]>(`${planogramJsonEndpoint}/${kioskName}`)
      .then((response) => {
        loggingService.log({
          level: LogLevel.INFO,
          message: 'Fetched planogram json from ogmentoAPI',
          component: 'HomePage.tsx',
          data: { kioskName, response }
        });

        if (response.length !== 0) {
          updatePlanogramJson(response).then((response) => {
            loggingService.log({
              level: LogLevel.INFO,
              message: 'Planogram json updated successfully from ExpoExtractor',
              component: 'HomePage.tsx',
              data: { response }
            });
          });
        } else {
          loggingService.log({
            level: LogLevel.INFO,
            message: 'The Planogram json from ExpoExtractor and the API are identical.',
            component: 'HomePage.tsx'
          });
        }
      })
      .catch((error) => {
        loggingService.log({
          level: LogLevel.ERROR,
          message: 'Error fetching planogram json from ogmentoAPI',
          component: 'HomePage',
          data: { error, kioskName }
        });
      });
  }, []);
  useEffect(() => {
    const fetchProductData = async (): Promise<void> => {
      try {
        const response = await getData<ProductDataModal[]>(oriflameProductApi);
        setProductData(response);
        setLoading(false);
      } catch (error) {
        loggingService.log({
          level: LogLevel.ERROR,
          message: 'Error fetching product data from API',
          component: 'HomePage.tsx',
          data: { error }
        });
      }
    };

    fetchProductData();
  }, []);

  const { products } = useAppSelector((state) => state.cart);

  useEffect(() => {
    const skuInCart = products.map((product) => product.skuCode);
    const filteredProducts = productData.filter((product) => skuInCart.includes(product.skuCode));
    const skuListOfSuggestions = filteredProducts
      .map((product) => product.productSuggestions)
      .flat();
    const productToShowForSuggestion = productData.filter((product) =>
      skuListOfSuggestions.includes(product.skuCode)
    );

    setProductSuggestion(productToShowForSuggestion);
  }, [productData, products]);

  useEffect(() => {
    const fetchCategoryData = async (): Promise<void> => {
      await getData<Category>(oriflameCategoriesApi).then((response) => {
        setCategories(response);
      });
    };
    fetchCategoryData();
  }, []);

  const filteredProducts = productData.filter((product) => {
    const matchesSearch =
      product.productName.toLowerCase().includes(productSearchText.toLowerCase()) ||
      product.skuCode.toLowerCase().includes(productSearchText.toLowerCase());

    const matchesCategory = selectedCategory
      ? product.category.toLowerCase() === selectedCategory.toLowerCase()
      : true;

    return matchesSearch && matchesCategory;
  });

  return (
    <>
      <Navbar />

      <Box sx={homePageStyles.homePageMainContainer}>
        <TextField
          variant="outlined"
          placeholder={translate('searchInputText')}
          value={productSearchText}
          onChange={onProductSearchChange}
          sx={homePageStyles.searchContainer}
          onFocus={() => {
            setIsProductCartOpen(false);
          }}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  {productSearchText ? (
                    <ClearIcon
                      onClick={() => {
                        setProductSearchText('');
                      }}
                      sx={{
                        color: theme.palette.text.primary,
                        cursor: 'pointer',
                        marginRight: '4px'
                      }}
                    />
                  ) : (
                    <Search
                      sx={{
                        color: theme.palette.text.primary,
                        cursor: 'pointer'
                      }}
                    />
                  )}
                </InputAdornment>
              )
            }
          }}
        />
        <Tooltip
          title={productCount <= 0 ? 'Cart is empty' : ''}
          color="secondary"
          onClick={() => {
            if (productCount > 0) {
              setIsProductCartOpen(true);
            }
          }}
        >
          <Stack direction="row" mr={1} alignItems="center">
            <IconButton
              onClick={() => {
                setIsProductCartOpen(true);
              }}
              disabled={productCount <= 0}
            >
              <Badge badgeContent={productCount} color="secondary">
                <LocalMallOutlinedIcon sx={{ fontSize: '30px' }} />
              </Badge>
            </IconButton>
            <Typography variant="body2" sx={{ fontSize: '1.2rem' }}>
              {translate('bag')}{' '}
            </Typography>
          </Stack>
        </Tooltip>
      </Box>
      {isProductCartOpen && productCount > 0 && (
        <ProductCart
          onCheckoutPageClose={onCloseProductCartPage}
          productSuggestionList={productSuggestions}
        />
      )}

      {!isProductCartOpen && (
        <>
          <Box component="img" src={HomePageBanner} sx={homePageStyles.bannerImage} />
          <Box sx={productPageStyle.productPageMainContainer}>
            <Box sx={productPageStyle.categoryContainer}>
              <MenuList sx={{ minHeight: '200px' }}>
                <MenuItem
                  key="category-ALL"
                  sx={{
                    textAlign: 'left',
                    backgroundColor:
                      selectedCategory === '' ? theme.palette.secondary.main : 'none',
                    borderTopRightRadius: '5px',
                    borderBottomRightRadius: '5px'
                  }}
                >
                  <ListItemText
                    onClick={() => {
                      setSelectedCategory('');
                      setProductSearchText('');
                    }}
                  >
                    ALL
                  </ListItemText>
                </MenuItem>
                <Divider
                  sx={{
                    width: '91%',
                    borderBottom: `1px solid ${theme.palette.primary.main}`,
                    marginLeft: '15px'
                  }}
                />
                {categories.map((category) => [
                  <MenuItem
                    key={`category-${category}`}
                    sx={{
                      textAlign: 'left',
                      backgroundColor:
                        selectedCategory === category ? theme.palette.secondary.main : 'none',
                      borderTopRightRadius: '5px',
                      borderBottomRightRadius: '5px'
                    }}
                    onClick={() => setSelectedCategory(category)}
                  >
                    <ListItemText
                      sx={{
                        textTransform: 'uppercase',
                        fontWeight: 700,
                        lineHeight: '16px',
                        fontSize: '14px'
                      }}
                    >
                      {category}
                    </ListItemText>
                  </MenuItem>,
                  <Divider
                    key={`divider-${category}`}
                    sx={{
                      width: '90%',
                      borderBottom: `1px solid ${theme.palette.primary.main}`,
                      marginLeft: '16px'
                    }}
                  />
                ])}
              </MenuList>
              <Box component="img" src={CategoryBanner} sx={productPageStyle.categoryBannerImage} />
            </Box>

            <Box sx={productPageStyle.productContainer}>
              <Box sx={productPageStyle.productCardContainer}>
                <OriflameLoader isLoading={loading} />
                <NoDataUtils status={!loading && filteredProducts.length <= 0} />
                {!loading &&
                  filteredProducts.length >= 0 &&
                  filteredProducts.map((product) => (
                    <ProductCard key={`card-${product.skuCode}`} product={product} />
                  ))}
              </Box>
            </Box>
          </Box>
        </>
      )}
    </>
  );
}

export default HomePage;
