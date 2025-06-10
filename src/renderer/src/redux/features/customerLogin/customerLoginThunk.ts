import { genericAsyncThunk } from '@/redux/core/utils/genericAsyncThunk';
import { postData } from '@/services/axiosWrapper/apiService';
import { otpGenerateEndpoint } from '@/utils/endpoints';
import { generateOtpAction } from './constant';

export const requestOtp = genericAsyncThunk<void, string>(
  generateOtpAction,
  async (phoneNumber) => {
    return postData(`${otpGenerateEndpoint}/${phoneNumber}`, {});
  }
);
