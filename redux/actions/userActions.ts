import axios from "axios";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { server } from "@/config";

export interface LoginPayload {
  email: string;
  password: string;
}

export const login = createAsyncThunk(
  "user/login",
  async (payload: LoginPayload, thunkAPI) => {
    try {
      const { data } = await axios.post(`${server}/auth/login`, payload);
      const token = data.user.token;
      localStorage.setItem("accessToken", token);
      document.cookie = `token=${token}; path=/`;
      return data.user;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Giriş yapılamadı';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

