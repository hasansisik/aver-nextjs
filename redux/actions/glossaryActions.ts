import axios from "axios";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { server } from "@/config";

// Get all glossary terms
export const getGlossaryTerms = createAsyncThunk(
  "glossary/getGlossaryTerms",
  async (_, thunkAPI) => {
    try {
      const { data } = await axios.get(`${server}/glossary`, {
        withCredentials: true
      });
      
      return data;
    } catch (error: any) {
      console.error("getGlossaryTerms Error:", error);
      const message = error.response?.data?.message || 'Sözlük terimleri alınamadı';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get a single glossary term by slug
export const getGlossaryTermBySlug = createAsyncThunk(
  "glossary/getGlossaryTermBySlug",
  async (slug: string, thunkAPI) => {
    try {
      const requestUrl = `${server}/glossary/${slug}`;      
      const { data } = await axios.get(requestUrl, {
        withCredentials: true
      });
      
      
      if (!data || !data.glossaryTerm) {
        console.error("No glossary term data in response");
        return thunkAPI.rejectWithValue('Sözlük terimi bulunamadı');
      }
      
      return data.glossaryTerm;
    } catch (error: any) {
      console.error("getGlossaryTermBySlug Error:", error);
      console.error("Full error object:", JSON.stringify(error, null, 2));
      const message = error.response?.data?.message || 'Sözlük terimi alınamadı';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get a glossary term by ID
export const getGlossaryTermById = createAsyncThunk(
  "glossary/getGlossaryTermById",
  async (termId: string, thunkAPI) => {
    try {
      const requestUrl = `${server}/glossary/id/${termId}`;
      
      const { data } = await axios.get(requestUrl, {
        withCredentials: true
      });
      
      return data.glossaryTerm;
    } catch (error: any) {
      console.error("getGlossaryTermById Error:", error);
      console.error("Full error object:", JSON.stringify(error, null, 2));
      const message = error.response?.data?.message || 'Sözlük terimi alınamadı';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Create a new glossary term
export interface CreateGlossaryTermPayload {
  title: string;
  description: string;
  content?: string;
  category?: string;
}

export const createGlossaryTerm = createAsyncThunk(
  "glossary/createGlossaryTerm",
  async (payload: CreateGlossaryTermPayload, thunkAPI) => {
    try {
      const token = localStorage.getItem("accessToken");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        withCredentials: true,
      };
      
      const { data } = await axios.post(`${server}/glossary/create`, payload, config);
      return data.glossaryTerm;
    } catch (error: any) {
      console.error("createGlossaryTerm Error:", error);
      const message = error.response?.data?.message || 'Sözlük terimi oluşturulamadı';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Update a glossary term
export interface UpdateGlossaryTermPayload {
  termId: string;
  title?: string;
  description?: string;
  content?: string;
  category?: string;
}

export const updateGlossaryTerm = createAsyncThunk(
  "glossary/updateGlossaryTerm",
  async (payload: UpdateGlossaryTermPayload, thunkAPI) => {
    try {
      const { termId, ...updateData } = payload;
      
      const token = localStorage.getItem("accessToken");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        withCredentials: true,
      };
      
      const { data } = await axios.put(`${server}/glossary/${termId}`, updateData, config);
      return data.glossaryTerm;
    } catch (error: any) {
      console.error("updateGlossaryTerm Error:", error);
      const message = error.response?.data?.message || 'Sözlük terimi güncellenemedi';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Delete a glossary term
export const deleteGlossaryTerm = createAsyncThunk(
  "glossary/deleteGlossaryTerm",
  async (termId: string, thunkAPI) => {
    try {
      const token = localStorage.getItem("accessToken");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        withCredentials: true,
      };
      
      const { data } = await axios.delete(`${server}/glossary/${termId}`, config);
      return { termId, message: data.message };
    } catch (error: any) {
      console.error("deleteGlossaryTerm Error:", error);
      const message = error.response?.data?.message || 'Sözlük terimi silinemedi';
      return thunkAPI.rejectWithValue(message);
    }
  }
); 