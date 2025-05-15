import axios from "axios";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { server } from "@/config";

// Get footer data
export const getFooter = createAsyncThunk(
  "footer/getFooter",
  async (_, thunkAPI) => {
    try {
      const { data } = await axios.get(`${server}/footer`, {
        withCredentials: true
      });
      return data.footer;
    } catch (error: any) {
      console.error("getFooter Error:", error);
      const message = error.response?.data?.message || 'Footer verileri alınamadı';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Update footer data
export interface UpdateFooterPayload {
  footerMenu?: Array<{name: string, link: string, isActive?: boolean}>;
  socialLinks?: Array<{name: string, link: string, isActive?: boolean}>;
  ctaText?: string;
  ctaLink?: string;
  copyright?: string;
  developerInfo?: string;
  developerLink?: string;
}

export const updateFooter = createAsyncThunk(
  "footer/updateFooter",
  async (payload: UpdateFooterPayload, thunkAPI) => {
    try {
      const token = localStorage.getItem("accessToken");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      };
      const { data } = await axios.put(`${server}/footer/update`, payload, config);
      return data.footer;
    } catch (error: any) {
      console.error("updateFooter Error:", error);
      const message = error.response?.data?.message || 'Footer güncellenemedi';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Add menu item
export interface AddMenuItemPayload {
  name: string;
  link: string;
  type: 'footerMenu' | 'socialLinks';
}

export const addMenuItem = createAsyncThunk(
  "footer/addMenuItem",
  async (payload: AddMenuItemPayload, thunkAPI) => {
    try {
      const token = localStorage.getItem("accessToken");
      
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        withCredentials: true,
      };
      
      const { data } = await axios.post(`${server}/footer/add-menu-item`, payload, config);
      return data.footer;
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
  type: 'footerMenu' | 'socialLinks';
}

export const removeMenuItem = createAsyncThunk(
  "footer/removeMenuItem",
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
      const { data } = await axios.delete(`${server}/footer/remove-menu-item`, config);
      return data.footer;
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
  type: 'footerMenu' | 'socialLinks';
}

export const reorderMenuItems = createAsyncThunk(
  "footer/reorderMenuItems",
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
      const { data } = await axios.put(`${server}/footer/reorder-menu-items`, payload, config);
      return data.footer;
    } catch (error: any) {
      console.error("reorderMenuItems Error:", error);
      const message = error.response?.data?.message || 'Menü öğeleri yeniden sıralanamadı';
      return thunkAPI.rejectWithValue(message);
    }
  }
); 