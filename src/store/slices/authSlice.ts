import { createAction, createReducer } from '@reduxjs/toolkit';

export const setCredentials = createAction<{ user: any; token: string }>('auth/SET_CREDENTIALS');
export const logout = createAction('auth/LOGOUT');
export const setSessionExpired = createAction<boolean>('auth/SET_SESSION_EXPIRED');
export const updateUserRole = createAction<string>('auth/UPDATE_USER_ROLE');
export const syncUser = createAction<any>('auth/SYNC_USER');

interface AuthState {
  token: string | null;
  user: any | null;
  isAuthenticated: boolean;
  isSessionExpired: boolean;
}

const getInitialUser = () => {
  const token = localStorage.getItem('adminToken');
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload;
  } catch (e) {
    return null;
  }
};

const initialState: AuthState = {
  token: localStorage.getItem('adminToken'),
  user: getInitialUser(),
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
    })
    .addCase(updateUserRole, (state, action) => {
      if (state.user) {
        state.user.role = action.payload;
      }
    })
    .addCase(syncUser, (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
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
    });
});

export default authReducer;
