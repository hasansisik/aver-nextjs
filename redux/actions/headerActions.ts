import axios from "axios";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { server } from "@/config";

// Get header data
export const getHeader = createAsyncThunk(
  "header/getHeader",
  async (_, thunkAPI) => {
    try {
      const { data } = await axios.get(`${server}/header`, {
        withCredentials: true
      });
      return data.header;
    } catch (error: any) {
      console.error("getHeader Error:", error);
      const message = error.response?.data?.message || 'Header verileri alınamadı';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Update header data
export interface UpdateHeaderPayload {
  mainMenu?: Array<{name: string, link: string, isActive?: boolean}>;
  socialLinks?: Array<{name: string, link: string, isActive?: boolean}>;
  logoText?: string;
  logoUrl?: string;
}

export const updateHeader = createAsyncThunk(
  "header/updateHeader",
  async (payload: UpdateHeaderPayload, thunkAPI) => {
    try {
      const token = localStorage.getItem("accessToken");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      };
      const { data } = await axios.put(`${server}/header/update`, payload, config);
      return data.header;
    } catch (error: any) {
      console.error("updateHeader Error:", error);
      const message = error.response?.data?.message || 'Header güncellenemedi';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Add menu item
export interface AddMenuItemPayload {
  name: string;
  link: string;
  type: 'mainMenu' | 'socialLinks';
}

export const addMenuItem = createAsyncThunk(
  "header/addMenuItem",
  async (payload: AddMenuItemPayload, thunkAPI) => {
    try {
      const token = localStorage.getItem("accessToken");
      
      console.log("AddMenuItem payload:", payload);
      console.log("Token:", token);
      
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        withCredentials: true,
      };
      
      console.log("Request config:", config);
      console.log("Request URL:", `${server}/header/add-menu-item`);
      
      const { data } = await axios.post(`${server}/header/add-menu-item`, payload, config);
      return data.header;
    } catch (error: any) {
      console.error("addMenuItem Error:", error.response || error);
      const message = error.response?.data?.message || 'Menü öğesi eklenemedi';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Remove menu item
export interface RemoveMenuItemPayload {
  itemId: string;
  type: 'mainMenu' | 'socialLinks';
}

export const removeMenuItem = createAsyncThunk(
  "header/removeMenuItem",
  async (payload: RemoveMenuItemPayload, thunkAPI) => {
    try {
      const token = localStorage.getItem("accessToken");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        withCredentials: true,
        data: payload
      };
      const { data } = await axios.delete(`${server}/header/remove-menu-item`, config);
      return data.header;
    } catch (error: any) {
      console.error("removeMenuItem Error:", error);
      const message = error.response?.data?.message || 'Menü öğesi kaldırılamadı';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Reorder menu items
export interface ReorderMenuItemsPayload {
  items: Array<{id: string, order: number}>;
  type: 'mainMenu' | 'socialLinks';
}

export const reorderMenuItems = createAsyncThunk(
  "header/reorderMenuItems",
  async (payload: ReorderMenuItemsPayload, thunkAPI) => {
    try {
      const token = localStorage.getItem("accessToken");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        withCredentials: true,
      };
      const { data } = await axios.put(`${server}/header/reorder-menu-items`, payload, config);
      return data.header;
    } catch (error: any) {
      console.error("reorderMenuItems Error:", error);
      const message = error.response?.data?.message || 'Menü öğeleri yeniden sıralanamadı';
      return thunkAPI.rejectWithValue(message);
    }
  }
); 