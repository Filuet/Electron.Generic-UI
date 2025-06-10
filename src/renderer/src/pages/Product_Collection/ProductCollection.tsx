/* eslint-disable @typescript-eslint/no-unused-vars */
import { Box, Container } from '@mui/system';
import { Divider, Typography, useTheme } from '@mui/material';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { GlobalStyles } from '@/globalStyles/globalStyles';
import { useAppDispatch, useAppSelector } from '@/redux/core/utils/reduxHook';

import {
  ProductCollectionMachine,
  DispenserError,
  MachineStatus,
  ProductAddress,
  PlanogramUpdateRequest,
  PageRoute,
  UndispenseProductDetailsDto,
  SkuAddress,
  UndispenseErrorProductsDto,
  DispenseStatus,
  UpdateDispenseStatusModal,
  MachineActiveStatus,
  LogLevel
} from '@/interfaces/modal';
import { useEffect, useState, useRef } from 'react';
import { dispenseProduct, getAllStatuses, getDispenseStatus } from '@/utils/expoApiUtils';
import { CartProduct } from '@/redux/features/cart/cartTypes';
import { setActivePage } from '@/redux/features/pageNavigation/navigationSlice';
import { DispensingErrorTracker } from '@/utils/DispensingFailedErrorTracker';
import { postData, updateData } from '@/services/axiosWrapper/apiService';
import {
  notTakenProductsEndpoint,
  undispensedProductsEndpoint,
  updateDispensedErrorProductEndpoint,
  updateDispensedProductQuantityEndpoint,
  updateDispenseStatusEndpoint
} from '@/utils/endpoints';
import { checkMachinesStatus, getActiveMachines } from '@/utils/dispenserUtils';
import LoggingService from '@/utils/loggingService';
import ProductCollectionBanner from '../../assets/images/Banners/Kiosk_Welcome_Page_Banner.jpg';
import OriflameLogo from '../../assets/images/Logo/Oriflame_logo_WelcomePage.png';
import ActivatedMachineImage from '../../assets/images/machines/ActivatedCurrentMachineImage.png';
import DeactiveMachineImage from '../../assets/images/machines/DeactivateMachineImage.png';
import { ProductCollectionStyles } from './productCollectionStyles';

function ProductCollection() {
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const globalStyles = GlobalStyles(theme);
  const productCollectionStyles = ProductCollectionStyles();
  const cartProducts: CartProduct[] = useAppSelector((state) => state.cart.products);
  const customerDetails = useAppSelector((state) => state.customerDetails);
  const { orderNumber } = useAppSelector((state) => state.cart);
  const [isReadyToPick, setIsReadyToPick] = useState(false);
  const [isDispensedProcessFinished, setIsDispensedProcessFinished] = useState(false);
  const [isFinalCheckCompleted, setIsFinalCheckCompleted] = useState<boolean>(false);
  const [blinkingMachine, setBlinkingMachine] = useState<ProductCollectionMachine | null>(null);
  type SKUInventory = {
    sku: string;
    count: number;
  };
  const [allStatuses, setAllStatuses] = useState<MachineStatus[]>([]);
  const [dispensingStartedKeys, setDispensingStartedKeys] = useState<Record<string, SKUInventory>>(
    {}
  );
  const [dispenseFinishedKeys, setDispenseFinishedKeys] = useState<Record<string, SKUInventory>>(
    {}
  );
  const expectedQuantities = cartProducts.reduce(
    (acc, product) => {
      acc[product.skuCode] = product.productCount;
      return acc;
    },
    {} as Record<string, number>
  );
  const inOperableMachines = useAppSelector((state) => state.expoExtractor.inoperableMachines);
  const getRemainingQuantities = (): SKUInventory[] => {
    return Object.entries(expectedQuantities).map(([sku, expected]) => {
      const finished = Object.values(dispenseFinishedKeys).reduce(
        (sum, item) => (item.sku === sku ? sum + item.count : sum),
        0
      );

      return {
        sku,
        count: expected - finished
      };
    });
  };
  const [unTrackedDispenseErrors, setUnTrackedDispenseErrors] = useState<DispenserError[]>([]);
  const [isPending, setIsPending] = useState(false);

  const [currentMachine, setCurrentMachine] = useState<ProductCollectionMachine | null>(
    ProductCollectionMachine.left
  );
  const statusCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const dispenseErrorTrackerRef = useRef<DispensingErrorTracker | null>(null);
  const orderCode = useAppSelector((state) => state.cart.orderCode);
  const machineActiveStatus: MachineActiveStatus = useAppSelector(
    (state) => state.kioskSettings.kioskSettings.machines
  );
  const checkMachines = async () => {
    const activeMachines = getActiveMachines(machineActiveStatus);
    await checkMachinesStatus(activeMachines);
  };

  useEffect(() => {
    dispenseErrorTrackerRef.current = new DispensingErrorTracker(); // Initialize tracker

    return () => {
      dispenseErrorTrackerRef.current = null;
    };
  }, []);
  useEffect(() => {
    async function startProductDispensing() {
      setIsPending(true);
      LoggingService.log({
        level: LogLevel.INFO,
        component: 'ProductCollection',
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

      await dispenseProduct(cartProducts)
        .then(() => {
          // the dispenseProduct api completed only when the products are picked up
          // Clear status check interval when dispensing process is complete

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

  const updatePlanogramForDispensedProducts = async (product: ProductAddress) => {
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
      const response = await updateData<PlanogramUpdateRequest, void>(
        updateDispensedProductQuantityEndpoint,
        planogramUpdateRequest
      );
      console.log(`API call to update planogram for SKU: ${product.sku} was successful`, response);
    } catch (error) {
      LoggingService.log({
        level: LogLevel.ERROR,
        component: 'ProductCollection',
        message: 'Request Body to update planogram',
        data: {
          planogramUpdateRequest
        }
      });
      console.error(`API call to update planogram for SKU: ${product.sku} failed`, error);
    }
  };

  const getTotalDispensedCount = (): number => {
    return Object.values(dispenseFinishedKeys).reduce((total, { count }) => total + count, 0);
  };
  const getUndispensedProducts = (): UndispenseProductDetailsDto => {
    const undispensedSkus = Object.entries(expectedQuantities).reduce<UndispenseProductDetailsDto>(
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

    return undispensedSkus;
  };

  // handle dispensed/undispensed products
  useEffect(() => {
    if (isDispensedProcessFinished) {
      Object.entries(dispenseFinishedKeys).forEach(([address, { sku, count }]) => {
        const addressSplit = address.split('/');
        updatePlanogramForDispensedProducts({
          machineId: addressSplit[0],
          trayId: addressSplit[1],
          beltId: addressSplit[2],
          quantity: count,
          sku
        });
      });

      const undispensedProducts: UndispenseProductDetailsDto = getUndispensedProducts();

      if (undispensedProducts.products.length > 0) {
        postData<UndispenseProductDetailsDto, boolean>(
          undispensedProductsEndpoint,
          undispensedProducts
        ).catch((error) => {
          LoggingService.log({
            level: LogLevel.ERROR,
            component: 'ProductCollection',
            message: 'Request body for failed undispensed products email',
            data: {
              undispensedProducts
            }
          });
          console.error('Failed to send undispensed products email:', error);
        });
      }

      const dispenseErrorProducts = dispenseErrorTrackerRef.current?.getAllErrors();

      if (dispenseErrorProducts && dispenseErrorProducts.length > 0) {
        const unDispensedRequestModal: UndispenseProductDetailsDto = {
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

        postData<UndispenseProductDetailsDto, boolean>(
          undispensedProductsEndpoint,
          unDispensedRequestModal
        ).catch((error) => {
          LoggingService.log({
            level: LogLevel.ERROR,
            component: 'ProductCollection',
            message: 'Request body for failed dispensed error products email',
            data: {
              unDispensedRequestModal
            }
          });
          console.error('Failed to send undispensed products email:', error);
        });
      }
      const abandonedProducts = dispenseErrorTrackerRef.current?.getAllAbandonedProducts();

      if (abandonedProducts && abandonedProducts?.length > 0) {
        const abandonedProductRequestModel: UndispenseProductDetailsDto = {
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

        postData<UndispenseProductDetailsDto, boolean>(
          notTakenProductsEndpoint,
          abandonedProductRequestModel
        ).catch((error) => {
          LoggingService.log({
            level: LogLevel.ERROR,
            component: 'ProductCollection',
            message: 'Request body for failed abandoned products email',
            data: {
              abandonedProductRequestModel
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

        const undispenseErrorProductsDto: UndispenseErrorProductsDto = {
          kioskName: import.meta.env.VITE_KIOSK_NAME,
          clientName: import.meta.env.VITE_KIOSK_CLIENT_NAME,
          routes
        };
        LoggingService.log({
          level: LogLevel.ERROR,
          component: 'ProductCollection',
          message: 'Empty or Inactive belts',
          data: {
            undispenseErrorProductsDto
          }
        });
        updateData<UndispenseErrorProductsDto, void>(
          updateDispensedErrorProductEndpoint,
          undispenseErrorProductsDto
        ).catch((err) => {
          console.error('Failed to update planogram quantity for empty and inactive belts', err);
        });
      }

      // Log dispenser errors
      if (unTrackedDispenseErrors.length > 0) {
        LoggingService.log({
          level: LogLevel.ERROR,
          component: 'ProductCollection',
          message: 'Untracked dispense errors',
          data: {
            unTrackedDispenseErrors
          }
        });
        console.log('Dispenser errors:', unTrackedDispenseErrors);
        // log(`Dispenser errors: ${JSON.stringify(dispenserErrors)}`);
      } else {
        console.log('No dispenser errors occurred.');
        //  log('No dispenser errors occurred.');
      }
    }
  }, [isDispensedProcessFinished]);

  const checkDispenseErrors = (status: MachineStatus): { isError: boolean; isTracked: boolean } => {
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

      LoggingService.log({
        level: LogLevel.ERROR,
        component: 'ProductCollection',
        message: `${errorCode.toLowerCase()}- ${message}`,
        data: { status, isTracked, ...(address && { address }) }
      });

      return { isError: true, isTracked }; // isTracked false
    }
    return { isError: false, isTracked: false };
  };

  // get all dispensing status when partially or zero sku dispensed
  useEffect(() => {
    const getAllDispensingStatuses = async () => {
      if (isFinalCheckCompleted) {
        const machineStatuses: MachineStatus[] = await getAllStatuses();
        const filteredStatuses = machineStatuses.filter(
          (reason) => !(reason.status === 'success' && reason.action === 'pending')
        );
        setAllStatuses(filteredStatuses);
        machineStatuses.forEach((machineStatus) => {
          checkDispenseErrors(machineStatus);
        });
        setIsDispensedProcessFinished(true);
        LoggingService.log({
          level: LogLevel.INFO,
          component: 'ProductCollection',
          message: 'Dispensing process completed'
        });
        console.log('Dispensing Process completed');
        // Add setTimeout here
        setTimeout(() => {
          dispatch(setActivePage(PageRoute.ThankYouPage));
        }, 5000); // 5 seconds delay

        console.log('Dispenser errors:', unTrackedDispenseErrors);
        console.log('---------------------------');
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
          console.log('Dispense status:', status);

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
                  console.log(`Dispensing started at ${startMatch[0]}`);
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

                  LoggingService.log({
                    level: LogLevel.INFO,
                    component: 'ProductCollection',
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

              LoggingService.log({
                level: LogLevel.INFO,
                component: 'ProductCollection',
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
                  console.log(`Dispensing finished for Machine ID: ${machineId}`);
                  // as we want to start the animation again
                  setIsReadyToPick(false);
                  setIsPending(true);
                  LoggingService.log({
                    level: LogLevel.INFO,
                    component: 'ProductCollection',
                    message: `Dispensing finished for Machine ID: ${machineId}`,
                    data: { status }
                  });
                }
              }
              break;
            default:
              console.log('Default Status:', status.action, status.message);
              LoggingService.log({
                level: LogLevel.DEBUG,
                component: 'ProductCollection',
                message: `Status update: ${status.action}`,
                data: { status }
              });
          }
        } catch (error) {
          console.error('Error fetching dispense status:', error);
          setUnTrackedDispenseErrors((prev) => [
            ...prev,
            { code: 'API_ERROR', message: 'Failed to fetch dispenser status' }
          ]);
          LoggingService.log({
            level: LogLevel.ERROR,
            component: 'ProductCollection',
            message: 'Failed to fetch dispense status',
            data: { error }
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

  const machineAnimationIntervalRef = useRef<NodeJS.Timeout | null>(null);

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

  const updateDispenseStatus = async (status: DispenseStatus) => {
    const updateDispenseStatusRequest: UpdateDispenseStatusModal = {
      status,
      orderCode
    };
    await updateData<UpdateDispenseStatusModal, void>(
      updateDispenseStatusEndpoint,
      updateDispenseStatusRequest
    ).catch((err) => {
      LoggingService.log({
        level: LogLevel.ERROR,
        component: 'ProductCollection',
        message: 'Request body for failed dispense status update',
        data: { updateDispenseStatusRequest }
      });
      console.log('error while updating dispense status in ogmentoAPI', err);
    });
  };

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

      LoggingService.log({
        level: LogLevel.INFO,
        component: 'ProductCollection',
        message: 'Dispensing process summary',
        data: {
          totalDispensed: getTotalDispensedCount(),
          undispensedProducts: getUndispensedProducts(),
          dispenseErrors: dispenseErrorTrackerRef.current?.getAllErrors(),
          abandonedProducts: dispenseErrorTrackerRef.current?.getAllAbandonedProducts(),
          allStatuses
        }
      });
    }
  }, [isDispensedProcessFinished]);

  type DisplayMessage = {
    mainMessage: string;
    undispensedProducts?: Array<{ skuName: string; quantity: number }>;
  };
  const getDisplayMessage = (): DisplayMessage | null => {
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
        getUndispensedProducts().products.length ||
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
        undispensedProducts: [
          ...getUndispensedProducts().products,
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

                {message.undispensedProducts && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" sx={productCollectionStyles.helperText}>
                      Products not dispensed:
                    </Typography>
                    {message.undispensedProducts.map(({ skuName: sku, quantity }) => (
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
                  : DeactiveMachineImage
              }
            />
            <Box
              component="img"
              src={
                currentMachine === ProductCollectionMachine.right
                  ? ActivatedMachineImage
                  : DeactiveMachineImage
              }
            />
          </>
        </Box>
      </Container>
    </Box>
  );
}
export default ProductCollection;
