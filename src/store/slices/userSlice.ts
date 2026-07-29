import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  organizationId?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

interface UserState {
  users: AdminUser[];
  deletedUsers: AdminUser[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: UserState = {
  users: [],
  deletedUsers: [],
  status: 'idle',
  error: null,
};

const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    fetchUsersStart: (state) => {
      state.status = 'loading';
      state.error = null;
    },
    fetchUsersSuccess: (state, action: PayloadAction<AdminUser[]>) => {
      state.status = 'succeeded';
      state.users = action.payload;
    },
    fetchDeletedUsersSuccess: (state, action: PayloadAction<AdminUser[]>) => {
      state.deletedUsers = action.payload;
    },
    fetchUsersFailure: (state, action: PayloadAction<string>) => {
      state.status = 'failed';
      state.error = action.payload;
    },
    addUserSuccess: (state, action: PayloadAction<AdminUser>) => {
      state.users.unshift(action.payload);
    },
    updateUserSuccess: (state, action: PayloadAction<AdminUser>) => {
      const index = state.users.findIndex(u => u.id === action.payload.id);
      if (index !== -1) {
        state.users[index] = action.payload;
      }
    },
    deleteUserSuccess: (state, action: PayloadAction<string>) => {
      const deletedUser = state.users.find(u => u.id === action.payload);
      state.users = state.users.filter(u => u.id !== action.payload);
      if (deletedUser) {
        state.deletedUsers.unshift({ ...deletedUser, status: 'INACTIVE' });
      }
    },
    restoreUserSuccess: (state, action: PayloadAction<AdminUser>) => {
      state.deletedUsers = state.deletedUsers.filter(u => u.id !== action.payload.id);
      state.users.unshift(action.payload);
    }
  },
});

export const {
  fetchUsersStart,
  fetchUsersSuccess,
  fetchDeletedUsersSuccess,
  fetchUsersFailure,
  addUserSuccess,
  updateUserSuccess,
  deleteUserSuccess,
  restoreUserSuccess
} = userSlice.actions;

export default userSlice.reducer;
