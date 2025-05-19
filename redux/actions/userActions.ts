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
      document.cookie = `token=${token}; path=/; max-age=86400`; // 24 hours
      return data.user;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Giriş yapılamadı';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const getMyProfile = createAsyncThunk(
  "user/getMyProfile",
  async (_, thunkAPI) => {
    try {
      const token = localStorage.getItem("accessToken");
      const { data } = await axios.get(`${server}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return data.user;
    } catch (error: any) {
      if (error.response?.status === 401) {
        window.location.href = '/login';
      }
      const message = error.response?.data?.message || 'Profil bilgileri alınamadı';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

