import axios from "axios";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { server } from "@/config";

// Helper function to determine if we're running on the server
const isServer = () => typeof window === 'undefined';

// Get all services without filtering
export const getServices = createAsyncThunk(
  "service/getServices",
  async (_, thunkAPI) => {
    try {
      // For server components, we don't need withCredentials
      const config = isServer() ? {} : { withCredentials: true };
      
      const { data } = await axios.get(`${server}/service`, config);
      
      console.log("API response data:", data);
      return data;
    } catch (error: any) {
      console.error("getServices Error:", error);
      const message = error.response?.data?.message || 'Servisler alınamadı';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get a single service by slug
export const getServiceBySlug = createAsyncThunk(
  "service/getServiceBySlug",
  async (slug: string, thunkAPI) => {
    try {
      console.log(`Fetching service with slug: ${slug}`);
      const requestUrl = `${server}/service/${slug}`;
      console.log(`Request URL: ${requestUrl}`);
      
      // For server components, we don't need withCredentials
      const config = isServer() ? {} : { withCredentials: true };
      
      const { data } = await axios.get(requestUrl, config);
      
      console.log("getServiceBySlug response:", data);
      
      if (!data || !data.service) {
        console.error("No service data in response");
        return thunkAPI.rejectWithValue('Servis bulunamadı');
      }
      
      return data.service;
    } catch (error: any) {
      console.error("getServiceBySlug Error:", error);
      console.error("Full error object:", JSON.stringify(error, null, 2));
      const message = error.response?.data?.message || 'Servis alınamadı';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Create a new service
export interface CreateServicePayload {
  title: string;
  description?: string;
  icon?: string;
  image?: string;
  contentBlocks?: Array<{
    type: string;
    content: string;
    metadata?: any;
  }>;
  features?: Array<{
    title: string;
    order?: number;
  }>;
  isPublished?: boolean;
}

export const createService = createAsyncThunk(
  "service/createService",
  async (payload: CreateServicePayload, thunkAPI) => {
    try {
      const token = localStorage.getItem("accessToken");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        withCredentials: true,
      };
      
      const { data } = await axios.post(`${server}/service/create`, payload, config);
      return data.service;
    } catch (error: any) {
      console.error("createService Error:", error);
      const message = error.response?.data?.message || 'Servis oluşturulamadı';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Update a service
export interface UpdateServicePayload {
  serviceId: string;
  title?: string;
  description?: string;
  icon?: string;
  image?: string;
  contentBlocks?: Array<{
    type: string;
    content: string;
    metadata?: any;
    order?: number;
  }>;
  features?: Array<{
    title: string;
    order?: number;
  }>;
  isPublished?: boolean;
}

export const updateService = createAsyncThunk(
  "service/updateService",
  async (payload: UpdateServicePayload, thunkAPI) => {
    try {
      const { serviceId, ...updateData } = payload;
      
      const token = localStorage.getItem("accessToken");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        withCredentials: true,
      };
      
      const { data } = await axios.put(`${server}/service/${serviceId}`, updateData, config);
      return data.service;
    } catch (error: any) {
      console.error("updateService Error:", error);
      const message = error.response?.data?.message || 'Servis güncellenemedi';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Delete a service
export const deleteService = createAsyncThunk(
  "service/deleteService",
  async (serviceId: string, thunkAPI) => {
    try {
      const token = localStorage.getItem("accessToken");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        withCredentials: true,
      };
      
      const { data } = await axios.delete(`${server}/service/${serviceId}`, config);
      return { serviceId, message: data.message };
    } catch (error: any) {
      console.error("deleteService Error:", error);
      const message = error.response?.data?.message || 'Servis silinemedi';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Add a content block to a service
export interface AddContentBlockPayload {
  serviceId: string;
  type: string;
  content: string;
  metadata?: any;
}

export const addContentBlock = createAsyncThunk(
  "service/addContentBlock",
  async (payload: AddContentBlockPayload, thunkAPI) => {
    try {
      const { serviceId, ...blockData } = payload;
      
      const token = localStorage.getItem("accessToken");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        withCredentials: true,
      };
      
      const { data } = await axios.post(`${server}/service/${serviceId}/blocks`, blockData, config);
      return data.service;
    } catch (error: any) {
      console.error("addContentBlock Error:", error);
      const message = error.response?.data?.message || 'İçerik bloğu eklenemedi';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Remove a content block from a service
export interface RemoveContentBlockPayload {
  serviceId: string;
  blockId: string;
}

export const removeContentBlock = createAsyncThunk(
  "service/removeContentBlock",
  async (payload: RemoveContentBlockPayload, thunkAPI) => {
    try {
      const { serviceId, blockId } = payload;
      
      const token = localStorage.getItem("accessToken");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        withCredentials: true,
        data: { blockId }
      };
      
      const { data } = await axios.delete(`${server}/service/${serviceId}/blocks`, config);
      return data.service;
    } catch (error: any) {
      console.error("removeContentBlock Error:", error);
      const message = error.response?.data?.message || 'İçerik bloğu kaldırılamadı';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Reorder content blocks within a service
export interface ReorderContentBlocksPayload {
  serviceId: string;
  blocks: Array<{id: string, order: number}>;
}

export const reorderContentBlocks = createAsyncThunk(
  "service/reorderContentBlocks",
  async (payload: ReorderContentBlocksPayload, thunkAPI) => {
    try {
      const { serviceId, blocks } = payload;
      
      const token = localStorage.getItem("accessToken");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        withCredentials: true,
      };
      
      const { data } = await axios.put(`${server}/service/${serviceId}/blocks/reorder`, { blocks }, config);
      return data.service;
    } catch (error: any) {
      console.error("reorderContentBlocks Error:", error);
      const message = error.response?.data?.message || 'İçerik blokları yeniden sıralanamadı';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Update a content block
export interface UpdateContentBlockPayload {
  serviceId: string;
  blockId: string;
  type?: string;
  content?: string;
  metadata?: any;
}

export const updateContentBlock = createAsyncThunk(
  "service/updateContentBlock",
  async (payload: UpdateContentBlockPayload, thunkAPI) => {
    try {
      const { serviceId, ...updateData } = payload;
      
      const token = localStorage.getItem("accessToken");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        withCredentials: true,
      };
      
      const { data } = await axios.put(`${server}/service/${serviceId}/blocks/update`, updateData, config);
      return data.service;
    } catch (error: any) {
      console.error("updateContentBlock Error:", error);
      const message = error.response?.data?.message || 'İçerik bloğu güncellenemedi';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get a service by ID
export const getServiceById = createAsyncThunk(
  "service/getServiceById",
  async (serviceId: string, thunkAPI) => {
    try {
      const requestUrl = `${server}/service/id/${serviceId}`;
      console.log("Making request to:", requestUrl);
      
      const { data } = await axios.get(requestUrl, {
        withCredentials: true
      });
      
      console.log("Service by ID response:", data);
      return data.service;
    } catch (error: any) {
      console.error("getServiceById Error:", error);
      console.error("Full error object:", JSON.stringify(error, null, 2));
      const message = error.response?.data?.message || 'Servis alınamadı';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Add or update a feature
export interface UpdateFeaturePayload {
  serviceId: string;
  featureId?: string;
  title: string;
  order?: number;
}

export const updateFeature = createAsyncThunk(
  "service/updateFeature",
  async (payload: UpdateFeaturePayload, thunkAPI) => {
    try {
      const { serviceId, ...featureData } = payload;
      
      const token = localStorage.getItem("accessToken");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        withCredentials: true,
      };
      
      const url = featureData.featureId 
        ? `${server}/service/${serviceId}/features/update`
        : `${server}/service/${serviceId}/features`;
      
      const { data } = await axios.post(url, featureData, config);
      return data.service;
    } catch (error: any) {
      console.error("updateFeature Error:", error);
      const message = error.response?.data?.message || 'Özellik güncellenemedi';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Remove a feature
export interface RemoveFeaturePayload {
  serviceId: string;
  featureId: string;
}

export const removeFeature = createAsyncThunk(
  "service/removeFeature",
  async (payload: RemoveFeaturePayload, thunkAPI) => {
    try {
      const { serviceId, featureId } = payload;
      
      const token = localStorage.getItem("accessToken");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        withCredentials: true,
        data: { featureId }
      };
      
      const { data } = await axios.delete(`${server}/service/${serviceId}/features`, config);
      return data.service;
    } catch (error: any) {
      console.error("removeFeature Error:", error);
      const message = error.response?.data?.message || 'Özellik kaldırılamadı';
      return thunkAPI.rejectWithValue(message);
    }
  }
); 