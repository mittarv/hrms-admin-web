import { createAction, createReducer } from '@reduxjs/toolkit';

export const setCredentials = createAction<{ user: any; token: string }>('auth/SET_CREDENTIALS');
export const logout = createAction('auth/LOGOUT');
export const setSessionExpired = createAction<boolean>('auth/SET_SESSION_EXPIRED');

interface AuthState {
  token: string | null;
  user: any | null;
  isAuthenticated: boolean;
  isSessionExpired: boolean;
}

const initialState: AuthState = {
  token: localStorage.getItem('adminToken'),
  user: localStorage.getItem('adminUser') ? JSON.parse(localStorage.getItem('adminUser') as string) : null,
  isAuthenticated: !!localStorage.getItem('adminToken'),
  isSessionExpired: false,
};

const authReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(setCredentials, (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.isSessionExpired = false;
      localStorage.setItem('adminToken', action.payload.token);
      localStorage.setItem('adminUser', JSON.stringify(action.payload.user));
    })
    .addCase(setSessionExpired, (state, action) => {
      state.isSessionExpired = action.payload;
    })
    .addCase(logout, (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isSessionExpired = false;
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
    });
});

export default authReducer;
