import { createAction, createReducer } from '@reduxjs/toolkit';

// Actions
export const fetchOrganizations = createAction('orgs/FETCH_ORGANIZATIONS');
export const fetchOrganizationsSuccess = createAction<any[]>('orgs/FETCH_ORGANIZATIONS_SUCCESS');
export const fetchOrganizationsFailure = createAction<string>('orgs/FETCH_ORGANIZATIONS_FAILURE');

export const createOrganizationAction = createAction('orgs/CREATE_ORGANIZATION');
export const createOrganizationSuccess = createAction<any>('orgs/CREATE_ORGANIZATION_SUCCESS');
export const createOrganizationFailure = createAction<string>('orgs/CREATE_ORGANIZATION_FAILURE');

const initialState = {
  organizations: [] as any[],
  status: 'idle',
  error: null as string | null,
};

const orgReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(fetchOrganizations, (state) => {
      state.status = 'loading';
      state.error = null;
    })
    .addCase(fetchOrganizationsSuccess, (state, action) => {
      state.status = 'succeeded';
      state.organizations = action.payload;
    })
    .addCase(fetchOrganizationsFailure, (state, action) => {
      state.status = 'failed';
      state.error = action.payload;
    })
    .addCase(createOrganizationAction, (state) => {
      state.status = 'loading';
      state.error = null;
    })
    .addCase(createOrganizationSuccess, (state, action) => {
      state.status = 'succeeded';
      state.organizations.push(action.payload);
    })
    .addCase(createOrganizationFailure, (state, action) => {
      state.status = 'failed';
      state.error = action.payload;
    });
});

export default orgReducer;
