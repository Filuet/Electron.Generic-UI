/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Box, Container } from '@mui/system';
import { Divider, Typography, useTheme } from '@mui/material';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { GlobalStyles } from '@/globalStyles/globalStyles';
import { useEffect, useState, useRef, JSX } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/core/utils/reduxHook';

import {
  ProductCollectionMachine,
  DispenserError,
  MachineStatus,
  DispensedProductInformation,
  PlanogramUpdateRequest,
  PageRoute,
  UnDispenseProductDetailsDto,
  SkuAddress,
  UnDispensedErrorProductsDto,
  DispenseStatus,
  UpdateDispenseStatusModal,
  MachineActiveStatus,
  LogLevel,
  PlanogramUpdateClientPortalModal,
  ProductInventoryModal,
  DispensingStatusModalForUi,
  DispenseError
} from '@/interfaces/modal';
import { dispenseProduct, getAllStatuses, getDispenseStatus } from '@/utils/expoApiUtils';
import { CartProduct } from '@/redux/features/cart/cartTypes';
import { setActivePage } from '@/redux/features/pageNavigation/navigationSlice';
import { DispensingErrorTracker } from '@/pages/ProductCollection/productCollectionUtils/DispensingFailedErrorTracker';
import { postData, updateData } from '@/services/axiosWrapper/apiService';
import {
  notTakenProductsEmailEndpoint,
  planogramUpdateClientPortalEndpoint,
  unDispensedProductsEmailEndpoint,
  updateDispensedErrorProductEndpoint,
  updateDispensedProductQuantityEndpoint,
  updateDispenseStatusEndpoint
} from '@/utils/endpoints';
import {
  checkMachinesStatus,
  getActiveMachines
} from '@/pages/ProductCollection/productCollectionUtils/dispenserUtils';
import { ProductCollectionStyles } from './productCollectionStyles';
import loggingService from '@/utils/loggingService';
import ProductCollectionBanner from '../../assets/images/Banners/Kiosk_Welcome_Page_Banner.jpg';
import OriflameLogo from '../../assets/images/Logo/Oriflame_logo_WelcomePage.png';
import ActivatedMachineImage from '../../assets/images/machines/ActivatedCurrentMachineImage.png';
import DeActiveMachineImage from '../../assets/images/machines/DeactivateMachineImage.png';

function ProductCollection(): JSX.Element {
  const COMPONENT_NAME = 'ProductCollection.tsx';

  const theme = useTheme();
  const dispatch = useAppDispatch();
  const globalStyles = GlobalStyles(theme);
  const productCollectionStyles = ProductCollectionStyles();
  const cartProducts: CartProduct[] = useAppSelector((state) => state.cart.products);
  const customerDetails = useAppSelector((state) => state.customerDetails);
  const { orderNumber } = useAppSelector((state) => state.cart);
  const [isReadyToPick, setIsReadyToPick] = useState(false);
  const [isDispensedProcessFinished, setIsDispensedProcessFinished] = useState(false);
  const [isFinalCheckCompleted, setIsFinalCheckCompleted] = useState<boolean>(false);
  const [blinkingMachine, setBlinkingMachine] = useState<ProductCollectionMachine | null>(null);
  const [allStatuses, setAllStatuses] = useState<MachineStatus[]>([]);
  const [dispensingStartedKeys, setDispensingStartedKeys] = useState<
    Record<string, ProductInventoryModal>
  >({});
  const [dispenseFinishedKeys, setDispenseFinishedKeys] = useState<
    Record<string, ProductInventoryModal>
  >({});
  const inOperableMachines = useAppSelector((state) => state.expoExtractor.inoperableMachines);
  const [unTrackedDispenseErrors, setUnTrackedDispenseErrors] = useState<DispenserError[]>([]);
  const [isPending, setIsPending] = useState(false);

  const [currentMachine, setCurrentMachine] = useState<ProductCollectionMachine | null>(
    ProductCollectionMachine.left
  );
  const statusCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const dispenseErrorTrackerRef = useRef<DispensingErrorTracker | null>(null);
  const machineAnimationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const orderCode = useAppSelector((state) => state.cart.orderCode);
  const machineActiveStatus: MachineActiveStatus = useAppSelector(
    (state) => state.kioskSettings.kioskSettings.machines
  );
  const expectedQuantities = cartProducts.reduce(
    (acc, product) => {
      acc[product.skuCode] = product.productCount;
      return acc;
    },
    {} as Record<string, number>
  );
  const checkMachines = async (): Promise<void> => {
    const activeMachines = getActiveMachines(machineActiveStatus);
    await checkMachinesStatus(activeMachines);
  };

  const updatePlanogramForDispensedProducts = async (
    product: DispensedProductInformation
  ): Promise<void> => {
    const planogramUpdateRequest: PlanogramUpdateRequest = {
      trayId: Number(product.trayId),
      beltId: Number(product.beltId),
      machineId: Number(product.machineId),
      kioskName: import.meta.env.VITE_KIOSK_NAME,
      clientName: import.meta.env.VITE_KIOSK_CLIENT_NAME,
      sku: product.sku,
      quantity: product.quantity
    };
    try {
      await updateData<PlanogramUpdateRequest, void>(
        updateDispensedProductQuantityEndpoint,
        planogramUpdateRequest
      );
      loggingService.log({
        level: LogLevel.INFO,
        component: COMPONENT_NAME,
        message: `Ogmento Planogram Updated for dispensed SKU: ${product.sku}`
      });
    } catch (error) {
      loggingService.log({
        level: LogLevel.ERROR,
        component: COMPONENT_NAME,
        message: 'Request Body to update planogram',
        data: {
          planogramUpdateRequest
        }
      });
    }
  };

  const getTotalDispensedCount = (): number => {
    return Object.values(dispenseFinishedKeys).reduce((total, { count }) => total + count, 0);
  };
  const getUnDispensedProducts = (): UnDispenseProductDetailsDto => {
    const unDispensedSkus = Object.entries(expectedQuantities).reduce<UnDispenseProductDetailsDto>(
      (acc, [sku, expectedCount]) => {
        const startedCount = Object.values(dispensingStartedKeys).reduce(
          (sum, item) => (item.sku === sku ? sum + item.count : sum),
          0
        );

        if (startedCount < expectedCount) {
          acc.products.push({
            skuName: sku,
            quantity: expectedCount - startedCount
          });
        }

        return acc;
      },
      {
        kioskName: import.meta.env.VITE_KIOSK_NAME,
        orderNumber: String(orderNumber),
        customerId: customerDetails.customerId,
        customerName: customerDetails.customerName,
        products: [],
        reason: allStatuses
      }
    );

    return unDispensedSkus;
  };

  const checkDispenseErrors = (status: MachineStatus): DispenseError => {
    const { status: statusCode, action, message } = status;

    if (statusCode === 'failed' && action === 'dispensing') {
      const isAbandoned = message.includes('Likely that products were abandoned');
      const isTracked = isAbandoned
        ? dispenseErrorTrackerRef.current?.handleAbandonedProductCount(status) || false
        : dispenseErrorTrackerRef.current?.handleDispensingFailedProductCount(status) || false;

      if (isTracked) {
        return { isError: true, isTracked }; // isTracked true
      }
      // If not tracked, handle untracked errors
      const addressMatch = message.match(/\[(.*?)\]/);
      const address = addressMatch?.[1];
      const skuInfo = address ? dispensingStartedKeys[address] : null;

      const errorCode = isAbandoned ? 'DISPENSE_ABANDONED' : 'DISPENSE_FAILED';
      const errorEntry: {
        code: string;
        message: string;
        sku?: string;
      } = {
        code: errorCode,
        message,
        ...(skuInfo?.sku && { sku: skuInfo.sku })
      };

      setUnTrackedDispenseErrors((prev) => [...prev, errorEntry]);

      loggingService.log({
        level: LogLevel.ERROR,
        component: COMPONENT_NAME,
        message: `${errorCode.toLowerCase()}- ${message}`,
        data: { status, isTracked, ...(address && { address }) }
      });

      return { isError: true, isTracked }; // isTracked false
    }
    return { isError: false, isTracked: false };
  };

  const updateDispenseStatus = async (status: DispenseStatus): Promise<void> => {
    const updateDispenseStatusRequest: UpdateDispenseStatusModal = {
      status,
      orderCode
    };
    await updateData<UpdateDispenseStatusModal, void>(
      updateDispenseStatusEndpoint,
      updateDispenseStatusRequest
    ).catch((err) => {
      loggingService.log({
        level: LogLevel.ERROR,
        component: COMPONENT_NAME,
        message: 'Request body for failed dispense status update',
        data: { updateDispenseStatusRequest, error: err }
      });
    });
  };

  const getDisplayMessage = (): DispensingStatusModalForUi | null => {
    // During dispensing
    if (isPending && !isDispensedProcessFinished) {
      return {
        mainMessage: 'Please wait while we are dispensing your product'
      };
    }

    // Ready to pick
    if (isReadyToPick) {
      return {
        mainMessage: 'Please collect your products from the highlighted machine'
      };
    }

    // After dispensing finished
    if (isDispensedProcessFinished) {
      const totalDispensed = getTotalDispensedCount();

      // Complete failure - no products dispensed
      if (totalDispensed === 0) {
        updateDispenseStatus(DispenseStatus.Failed);
        return {
          mainMessage: 'Dispensing failed! No products were dispensed'
        };
      }

      // Check for any type of error or incomplete dispensing
      const hasDispenseIssues = Boolean(
        getUnDispensedProducts().products.length ||
          dispenseErrorTrackerRef.current?.getAllErrors().length ||
          dispenseErrorTrackerRef.current?.getAllAbandonedProducts().length ||
          unTrackedDispenseErrors.length
      );

      if (!hasDispenseIssues) {
        updateDispenseStatus(DispenseStatus.Completed);
        return {
          mainMessage: 'Dispensing completed!'
        };
      }

      // If there were any issues, show partial completion
      updateDispenseStatus(DispenseStatus.PartiallyCompleted);
      return {
        mainMessage: 'Dispensing partially completed!',
        unDispensedProducts: [
          ...getUnDispensedProducts().products,
          ...(dispenseErrorTrackerRef.current?.getAllErrors() || []).map((p) => ({
            skuName: p.sku,
            quantity: p.count
          })),
          ...(dispenseErrorTrackerRef.current?.getAllAbandonedProducts() || []).map((p) => ({
            skuName: p.sku,
            quantity: p.count
          }))
        ]
      };
    }

    return null;
  };
  // Initializing new DispensingErrorTracker object. on component mount
  useEffect(() => {
    dispenseErrorTrackerRef.current = new DispensingErrorTracker(); // Initialize tracker

    return () => {
      dispenseErrorTrackerRef.current = null;
    };
  }, []);

  // Starts the dispensing process on component mount
  useEffect(() => {
    async function startProductDispensing(): Promise<void> {
      setIsPending(true);
      loggingService.log({
        level: LogLevel.INFO,
        component: COMPONENT_NAME,
        message: 'Dispensing process started',
        data: {
          products: cartProducts.map(({ skuCode, productCount }) => ({
            skuCode,
            productCount
          }))
        }
      });
      if (inOperableMachines.length > 0) {
        await checkMachines();
      }

      loggingService.log({
        level: LogLevel.INFO,
        component: COMPONENT_NAME,
        message: 'Calling dispenseProduct API (dispensing/extract)',
        data: {
          cartProducts: cartProducts.map(({ skuCode, productCount }) => ({ skuCode, productCount }))
        }
      });
      await dispenseProduct(cartProducts)
        .then(() => {
          // the dispenseProduct api completed only when the products are picked up
          // Clear status check interval when dispensing process is complete
          loggingService.log({
            level: LogLevel.INFO,
            component: COMPONENT_NAME,
            message: 'Extract api has completed successfully'
          });

          if (statusCheckIntervalRef.current) {
            clearInterval(statusCheckIntervalRef.current);
            statusCheckIntervalRef.current = null;
          }
        })
        .finally(() => {
          setIsPending(false);
          setIsReadyToPick(false);
          setIsFinalCheckCompleted(true);
        });
    }
    startProductDispensing();
  }, []);

  // handle dispensed/unDispensed products
  useEffect(() => {
    if (isDispensedProcessFinished) {
      const productsDispensed: PlanogramUpdateClientPortalModal = {
        kioskName: import.meta.env.VITE_KIOSK_NAME,
        productInfo: []
      };
      Object.entries(dispenseFinishedKeys).forEach(([address, { sku, count }]) => {
        const addressSplit = address.split('/');
        const dispensedProductInfo: DispensedProductInformation = {
          machineId: addressSplit[0],
          trayId: addressSplit[1],
          beltId: addressSplit[2],
          sku,
          quantity: count
        };
        updatePlanogramForDispensedProducts(dispensedProductInfo);
        productsDispensed.productInfo.push(dispensedProductInfo);
      });
      postData<PlanogramUpdateClientPortalModal, string | void>(
        planogramUpdateClientPortalEndpoint,
        productsDispensed
      );
      const unDispensedProducts: UnDispenseProductDetailsDto = getUnDispensedProducts();

      if (unDispensedProducts.products.length > 0) {
        postData<UnDispenseProductDetailsDto, boolean>(
          unDispensedProductsEmailEndpoint,
          unDispensedProducts
        ).catch((error) => {
          loggingService.log({
            level: LogLevel.ERROR,
            component: COMPONENT_NAME,
            message: 'Failed to send unDispensed products email',
            data: {
              error: JSON.stringify(error),
              unDispensedProducts: unDispensedProducts
            }
          });
          console.error('Failed to send unDispensed products email:', error);
        });
      }

      const dispenseErrorProducts = dispenseErrorTrackerRef.current?.getAllErrors();

      if (dispenseErrorProducts && dispenseErrorProducts.length > 0) {
        const unDispensedRequestModal: UnDispenseProductDetailsDto = {
          kioskName: import.meta.env.VITE_KIOSK_NAME,
          orderNumber: String(orderNumber),
          customerId: customerDetails.customerId,
          customerName: customerDetails.customerName,
          products: dispenseErrorProducts.map((product) => ({
            skuName: product.sku,
            quantity: product.count
          })),
          reason: allStatuses
        };

        postData<UnDispenseProductDetailsDto, boolean>(
          unDispensedProductsEmailEndpoint,
          unDispensedRequestModal
        ).catch((error) => {
          loggingService.log({
            level: LogLevel.ERROR,
            component: COMPONENT_NAME,
            message: 'Failed to send dispensed error products email',
            data: {
              error: JSON.stringify(error),
              unDispensedRequestModal,
              dispenseErrorProducts
            }
          });
          console.error('Failed to send undispensed products email:', error);
        });
      }
      const abandonedProducts = dispenseErrorTrackerRef.current?.getAllAbandonedProducts();

      if (abandonedProducts && abandonedProducts?.length > 0) {
        const abandonedProductRequestModel: UnDispenseProductDetailsDto = {
          kioskName: import.meta.env.VITE_KIOSK_NAME,
          orderNumber: String(orderNumber),
          customerId: customerDetails.customerId,
          customerName: customerDetails.customerName,
          products: abandonedProducts.map((product) => ({
            skuName: product.sku,
            quantity: product.count
          })),
          reason: []
        };

        postData<UnDispenseProductDetailsDto, boolean>(
          notTakenProductsEmailEndpoint,
          abandonedProductRequestModel
        ).catch((error) => {
          loggingService.log({
            level: LogLevel.ERROR,
            component: COMPONENT_NAME,
            message: 'Failed to send abandoned products email',
            data: {
              error: JSON.stringify(error),
              abandonedProductRequestModel,
              abandonedProducts
            }
          });
          console.error('Failed to send abandoned products email:', error);
        });
      }
      const errorRoutes = dispenseErrorProducts?.map((product) => product.address);
      if (errorRoutes && errorRoutes.length > 0) {
        const routes: SkuAddress[] = [];

        for (let i = 0; i < errorRoutes.length; i += 1) {
          const route = errorRoutes[i].split('/');
          const machineId = Number(route[0]);
          const trayId = Number(route[1]);
          const beltId = Number(route[2]);

          routes.push({ machineId, trayId, beltId });
        }

        const undispenseErrorProductsDto: UnDispensedErrorProductsDto = {
          kioskName: import.meta.env.VITE_KIOSK_NAME,
          clientName: import.meta.env.VITE_KIOSK_CLIENT_NAME,
          routes
        };
        loggingService.log({
          level: LogLevel.ERROR,
          component: COMPONENT_NAME,
          message: 'Empty or Inactive belts',
          data: {
            undispenseErrorProductsDto
          }
        });
        updateData<UnDispensedErrorProductsDto, void>(
          updateDispensedErrorProductEndpoint,
          undispenseErrorProductsDto
        ).catch((err) => {
          loggingService.log({
            level: LogLevel.ERROR,
            component: COMPONENT_NAME,
            message: 'Failed to update planogram quantity for empty and inactive belts',
            data: {
              error: JSON.stringify(err),
              undispenseErrorProductsDto,
              errorRoutes
            }
          });
          console.error('Failed to update planogram quantity for empty and inactive belts', err);
        });
      }

      // Log dispenser errors
      if (unTrackedDispenseErrors.length > 0) {
        loggingService.log({
          level: LogLevel.ERROR,
          component: COMPONENT_NAME,
          message: 'Untracked dispense errors',
          data: {
            unTrackedDispenseErrors
          }
        });
      } else {
        loggingService.log({
          level: LogLevel.INFO,
          component: COMPONENT_NAME,
          message: 'No untracked dispense errors'
        });
      }
    }
  }, [isDispensedProcessFinished]);

  // get all dispensing status when partially or zero sku dispensed
  useEffect(() => {
    const getAllDispensingStatuses = async (): Promise<void> => {
      if (isFinalCheckCompleted) {
        const machineStatuses: MachineStatus[] = await getAllStatuses();
        const filteredStatuses = machineStatuses.filter(
          (reason) =>
            !(
              reason.status === 'success' &&
              reason.action === 'pending' &&
              reason.message.includes('Waiting for command')
            )
        );
        setAllStatuses(filteredStatuses);
        filteredStatuses.forEach((machineStatus) => {
          checkDispenseErrors(machineStatus);
        });
        setIsDispensedProcessFinished(true);
        loggingService.log({
          level: LogLevel.INFO,
          component: COMPONENT_NAME,
          message: 'Dispensing process completed'
        });

        // Add setTimeout here
        setTimeout(() => {
          dispatch(setActivePage(PageRoute.ThankYouPage));
        }, 5000); // 5 seconds delay
        loggingService.log({
          level: LogLevel.INFO,
          component: COMPONENT_NAME,
          message: 'Dispensing process completed, Navigating to thank you page after 5 seconds',
          data: { unTrackedDispenseErrors }
        });
      }
    };

    getAllDispensingStatuses();
  }, [isFinalCheckCompleted]);

  // dispense status handler
  useEffect(() => {
    if (!isDispensedProcessFinished) {
      statusCheckIntervalRef.current = setInterval(async () => {
        try {
          const status: MachineStatus = await getDispenseStatus();
          loggingService.log({
            level: LogLevel.INFO,
            component: COMPONENT_NAME,
            message: 'Current Status:',
            data: status
          });
          // Check for dispensing failure
          const dispensingFailure = checkDispenseErrors(status);
          if (dispensingFailure.isError) {
            return;
          }

          switch (status.action) {
            case 'dispensing':
              {
                const startMatch = status.message.match(/(\d+)\/(\d+)\/(\d+).*sku:(\d+)/);
                if (startMatch) {
                  loggingService.log({
                    level: LogLevel.INFO,
                    component: COMPONENT_NAME,
                    message: `Dispensing in process ${startMatch[0]}`
                  });

                  const dispenserKey = `${startMatch[1]}/${startMatch[2]}/${startMatch[3]}`;
                  const sku = startMatch[4];

                  // Set which machine should blink based on machine ID
                  const machineId = Number(startMatch[1]);
                  setBlinkingMachine(
                    machineId === 1 ? ProductCollectionMachine.left : ProductCollectionMachine.right
                  );

                  setDispensingStartedKeys((prev) => ({
                    ...prev,
                    [dispenserKey]: {
                      sku,
                      count: (prev[dispenserKey]?.count || 0) + 1
                    }
                  }));

                  loggingService.log({
                    level: LogLevel.INFO,
                    component: COMPONENT_NAME,
                    message: `Dispensing in process ${sku}`,
                    data: {
                      machineId,
                      trayId: startMatch[2],
                      beltId: startMatch[3],
                      sku
                    }
                  });
                }
              }

              break;
            case 'dispensed': {
              const match = status.message.match(/(\d+)\/(\d+)\/(\d+).*sku:(\d+)/);
              if (match) {
                const dispenserKey = `${match[1]}/${match[2]}/${match[3]}`;
                const sku = match[4];
                setDispenseFinishedKeys((prev) => ({
                  ...prev,
                  [dispenserKey]: {
                    sku,
                    count: (prev[dispenserKey]?.count || 0) + 1
                  }
                }));
              }

              break;
            }

            case 'takeproducts': {
              setIsPending(false);
              setIsReadyToPick(true);

              loggingService.log({
                level: LogLevel.INFO,
                component: COMPONENT_NAME,
                message: 'Products ready for pickup',
                data: { status }
              });

              break;
            }
            case 'pending':
              if (status.message.includes('Dispensing from unit')) {
                const pendingMatch = status.message.match(/unit #(\d+)/);
                if (pendingMatch) {
                  const machineId = pendingMatch[1];
                  // as we want to start the animation again
                  setIsReadyToPick(false);
                  setIsPending(true);
                  loggingService.log({
                    level: LogLevel.INFO,
                    component: COMPONENT_NAME,
                    message: `Dispensing finished for Machine ID: ${machineId}`,
                    data: { status }
                  });
                }
              }
              break;
            default:
              loggingService.log({
                level: LogLevel.DEBUG,
                component: COMPONENT_NAME,
                message: `Status update: ${status.action}`,
                data: { status }
              });
          }
        } catch (error) {
          setUnTrackedDispenseErrors((prev) => [
            ...prev,
            { code: 'API_ERROR', message: 'Failed to fetch dispenser status' }
          ]);
          loggingService.log({
            level: LogLevel.ERROR,
            message: 'Error fetching dispense status',
            component: COMPONENT_NAME,
            data: {
              error,
              cartProducts: cartProducts.map(({ skuCode, productCount }) => ({
                skuCode,
                productCount
              })),
              dispensingStartedKeys,
              dispenseFinishedKeys
            }
          });
        }
      }, 2000);
    }

    return () => {
      if (statusCheckIntervalRef.current) {
        clearInterval(statusCheckIntervalRef.current);
        statusCheckIntervalRef.current = null;
      }
    };
  }, [isDispensedProcessFinished]);

  // machine animation
  useEffect(() => {
    if (machineAnimationIntervalRef.current) {
      clearInterval(machineAnimationIntervalRef.current);
      machineAnimationIntervalRef.current = null;
    }

    // Add isDispensedProcessFinished to animation conditions
    const shouldAnimate = !isReadyToPick && !isDispensedProcessFinished && blinkingMachine !== null;

    if (shouldAnimate) {
      // Blinking animation
      machineAnimationIntervalRef.current = setInterval(() => {
        setCurrentMachine((prev) => (prev === blinkingMachine ? null : blinkingMachine));
      }, 500);
    } else if ((isReadyToPick || isDispensedProcessFinished) && blinkingMachine) {
      // Keep the machine highlighted when ready to pick or dispensing is finished
      setCurrentMachine(blinkingMachine);
    }

    return () => {
      if (machineAnimationIntervalRef.current) {
        clearInterval(machineAnimationIntervalRef.current);
        machineAnimationIntervalRef.current = null;
      }
    };
  }, [isReadyToPick, blinkingMachine, isDispensedProcessFinished]);

  useEffect(() => {
    if (isDispensedProcessFinished) {
      // Log all error tracking information
      console.group('Dispensing Error Summary');

      // Log tracked errors from DispensingErrorTracker
      if (dispenseErrorTrackerRef.current) {
        const failedDispenses = dispenseErrorTrackerRef.current.getAllErrors();
        const abandonedProducts = dispenseErrorTrackerRef.current.getAllAbandonedProducts();

        console.group('Tracked Errors');
        if (failedDispenses.length > 0) {
          console.table(failedDispenses);
        } else {
          console.log('No failed dispenses tracked');
        }

        if (abandonedProducts.length > 0) {
          console.table(abandonedProducts);
        } else {
          console.log('No abandoned products tracked');
        }
        console.groupEnd();
      }

      // Log untracked dispenser errors
      console.group('Untracked Errors');
      if (unTrackedDispenseErrors.length > 0) {
        console.table(
          unTrackedDispenseErrors.map((error) => ({
            code: error.code,
            message: error.message,
            sku: error.code || 'N/A'
          }))
        );
      } else {
        console.log('No untracked dispenser errors');
      }
      console.groupEnd();

      console.groupEnd();

      loggingService.log({
        level: LogLevel.INFO,
        component: COMPONENT_NAME,
        message: 'Dispensing process summary',
        data: {
          totalDispensed: getTotalDispensedCount(),
          unDispensedProducts: getUnDispensedProducts(),
          dispenseErrors: dispenseErrorTrackerRef.current?.getAllErrors(),
          abandonedProducts: dispenseErrorTrackerRef.current?.getAllAbandonedProducts(),
          allStatuses
        }
      });
    }
  }, [isDispensedProcessFinished]);

  return (
    <Box
      sx={{
        backgroundImage: `url(${ProductCollectionBanner})`,
        ...globalStyles.pageContainer
      }}
    >
      <Container
        sx={{
          width: '535px',
          height: '791px',
          ...globalStyles.pageContentContainer
        }}
      >
        <Box component="img" src={OriflameLogo} sx={{ width: '262px' }} />

        {/* Add status information */}
        <Box sx={{ textAlign: 'center', my: 2 }}>
          {(() => {
            const message = getDisplayMessage();
            if (!message) return null;

            return (
              <>
                <Typography variant="body1" sx={productCollectionStyles.helperText}>
                  {message.mainMessage}
                </Typography>

                {message.unDispensedProducts && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" sx={productCollectionStyles.helperText}>
                      Products not dispensed:
                    </Typography>
                    {message.unDispensedProducts.map(({ skuName: sku, quantity }) => (
                      <Typography key={sku} variant="body2" sx={productCollectionStyles.helperText}>
                        SKU: {sku} - Quantity: {quantity}
                      </Typography>
                    ))}
                  </Box>
                )}
              </>
            );
          })()}
        </Box>

        <Divider
          sx={{
            width: '535px',
            border: `2px solid ${theme.palette.primary.main}`,
            marginTop: '100px'
          }}
        />

        <Box
          sx={{
            width: '428px',
            display: 'flex',
            justifyContent: 'space-around'
          }}
        >
          {isReadyToPick ? (
            <>
              <Box sx={{ width: '93px' }}>
                {currentMachine === ProductCollectionMachine.left && (
                  <ArrowDownwardIcon sx={{ fontSize: '93px', marginTop: '10px' }} />
                )}
              </Box>

              <Box sx={{ width: '93px' }}>
                {currentMachine === ProductCollectionMachine.right && (
                  <ArrowDownwardIcon sx={{ fontSize: '93px', marginTop: '10px' }} />
                )}
              </Box>
            </>
          ) : (
            <Box sx={{ width: '93px', height: '93px', marginTop: '10px' }} />
          )}
        </Box>

        <Box
          sx={{
            width: '428px',
            display: 'flex',
            justifyContent: 'space-around'
          }}
        >
          <>
            <Box
              component="img"
              src={
                currentMachine === ProductCollectionMachine.left
                  ? ActivatedMachineImage
                  : DeActiveMachineImage
              }
            />
            <Box
              component="img"
              src={
                currentMachine === ProductCollectionMachine.right
                  ? ActivatedMachineImage
                  : DeActiveMachineImage
              }
            />
          </>
        </Box>
      </Container>
    </Box>
  );
}
export default ProductCollection;
