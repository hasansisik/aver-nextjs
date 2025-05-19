import { createReducer } from "@reduxjs/toolkit";
import {
  login,
  getMyProfile,
} from "../actions/userActions";

interface userState {
  user: any;
  loading: boolean;
  error: string | null;
  isAuthenticated?: boolean;
  message?: string;
  users?: any[];
  notes?: any[];
}

const initialState: userState = {
  user: {},
  loading: false,
  error: null,
  users: [],
  notes: [],
};

export const userReducer = createReducer(initialState, (builder) => {
  builder
    // Login
    .addCase(login.pending, (state) => {
      state.loading = true;
    })
    .addCase(login.fulfilled, (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload;
    })
    .addCase(login.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    })
    // Get My Profile
    .addCase(getMyProfile.pending, (state) => {
      state.loading = true;
    })
    .addCase(getMyProfile.fulfilled, (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload;
    })
    .addCase(getMyProfile.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
});

export default userReducer;