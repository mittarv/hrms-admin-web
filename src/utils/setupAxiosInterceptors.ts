import axios from 'axios';
import { store } from '../store';
import { setSessionExpired } from '../store/slices/authSlice';

export const setupAxiosInterceptors = () => {
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response && error.response.status === 401) {
        const url = error.config?.url || '';
        // Don't trigger session expired for auth / invite flows
        const isAuthEndpoint =
          url.includes('/auth/') ||
          url.includes('/login') ||
          url.includes('verify-invite');
        if (!isAuthEndpoint) {
          store.dispatch(setSessionExpired(true));
        }
      }
      return Promise.reject(error);
    }
  );
};
