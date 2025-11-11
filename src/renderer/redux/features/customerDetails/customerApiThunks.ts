import { genericAsyncThunk } from '@/redux/core/utils/genericAsyncThunk';
import { getCustomerOrderDetailsEndpoint } from '@/utils/endpoints';
import { getData } from '@/services/axiosWrapper/apiService';
import { CustomerOrderDetails } from './types';

export const fetchCustomerOrderDetails = genericAsyncThunk<CustomerOrderDetails, string>(
  'fetchCustomerOrderDetails',
  async (customerID) => {
    const response = await getData<CustomerOrderDetails>(
      `${getCustomerOrderDetailsEndpoint}/${customerID}`
    );
    return response;
  }
);
