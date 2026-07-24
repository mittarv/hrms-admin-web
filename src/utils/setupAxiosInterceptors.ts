import axios from 'axios';
import { store } from '../store';
import { setSessionExpired } from '../store/slices/authSlice';

export const setupAxiosInterceptors = () => {
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response && error.response.status === 401) {
        const url = error.config?.url || '';
        // Don't trigger session expired modal for the login endpoint itself
        const isLoginEndpoint = url.includes('/auth/login') || url.includes('/login');
        if (!isLoginEndpoint) {
          store.dispatch(setSessionExpired(true));
        }
      }
      return Promise.reject(error);
    }
  );
};
