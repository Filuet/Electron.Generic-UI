import { LoginResponseModel, LogLevel } from '@/interfaces/modal';
import { AUTH_TOKEN_KEY, SESSION_ID } from '@/utils/constants';
import { BASE_URL, kioskLoginEndpoint } from '@/utils/endpoints';
import { LocalStorageWrapper } from '@/utils/localStorageWrapper';
import axios, { AxiosError, AxiosResponse } from 'axios';
import loggingService from '@/utils/loggingService';

export const axiosInstance = axios.create({
  baseURL: BASE_URL
});

axiosInstance.interceptors.request.use(
  (config) => {
    const myConfig = config;
    loggingService.log({
      level: LogLevel.INFO,
      message: 'Axios request',
      component: 'axiosInstance',
      data: {
        url: config.url,
        method: config.method
      }
    });
    const token: string | null = LocalStorageWrapper.getAuthToken();
    if (token) {
      myConfig.headers.Authorization = `Bearer ${token}`;
    }
    const customerSessionId: string | null = LocalStorageWrapper.getItem(SESSION_ID);
    if (customerSessionId) {
      myConfig.headers.set('X-Customer-Session-ID', customerSessionId);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Flag to prevent multiple token refresh requests
let isRefreshing = false;
// Store of callbacks to be executed after token refresh
let refreshSubscribers: ((token: string) => void)[] = [];

// Function to add callbacks to the subscriber list
const subscribeToTokenRefresh = (cb: (token: string) => void): void => {
  refreshSubscribers.push(cb);
};

// Function to execute all callbacks with new token
const onTokenRefreshed = (token: string): void => {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
};
// Handle token refresh
const refreshAuthToken = async (): Promise<string | null> => {
  try {
    const response = await axios.post<LoginResponseModel>(`${BASE_URL}${kioskLoginEndpoint}`, {
      email: import.meta.env.VITE_KIOSK_EMAIL,
      password: import.meta.env.VITE_KIOSK_PASSWORD
    });

    const newToken = response.data.token;
    if (newToken) {
      LocalStorageWrapper.setItem(AUTH_TOKEN_KEY, newToken);
      return newToken;
    }
    return null;
  } catch (error) {
    loggingService.log({
      level: LogLevel.ERROR,
      message: 'Token refresh failed',
      component: 'axiosInstance',
      data: {
        error: JSON.stringify(error),
        endpoint: kioskLoginEndpoint
      }
    });

    loggingService.log({
      level: LogLevel.ERROR,
      message: 'Token refresh failed',
      component: 'axiosInstance',
      data: {
        error
      }
    });
    // Clear token and redirect to maintenance page
    LocalStorageWrapper.removeItem(AUTH_TOKEN_KEY);
    window.dispatchEvent(new CustomEvent('auth-error'));
    return null;
  }
};

// Response interceptor
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config;
    loggingService.log({
      level: LogLevel.ERROR,
      message: 'Axios response error',
      component: 'axiosInstance',
      data: {
        url: originalRequest?.url,
        method: originalRequest?.method,
        status: error.response?.status
      }
    });
    // Check if error is 401 and we haven't tried refreshing yet
    if (error.response?.status === 401 && originalRequest && !originalRequest.headers['X-Retry']) {
      loggingService.log({
        level: LogLevel.ERROR,
        message: 'Axios response error',
        component: 'axiosInstance',
        data: {
          url: originalRequest?.url,
          method: originalRequest?.method,
          status: error.response?.status,
          message: error.message
        }
      });
      if (!isRefreshing) {
        isRefreshing = true;

        const newToken = await refreshAuthToken();

        isRefreshing = false;

        if (newToken) {
          onTokenRefreshed(newToken);

          // Retry the original request with new token
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          originalRequest.headers['X-Retry'] = 'true';
          return axiosInstance(originalRequest);
        }
      }

      // If we're already refreshing, wait for the new token
      const retryOriginalRequest = new Promise((resolve) => {
        subscribeToTokenRefresh((token: string) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          originalRequest.headers['X-Retry'] = 'true';
          resolve(axiosInstance(originalRequest));
        });
      });

      return retryOriginalRequest;
    }

    return Promise.reject(error);
  }
);
