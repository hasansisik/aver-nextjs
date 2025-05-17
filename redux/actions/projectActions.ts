import axios from "axios";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { server } from "@/config";

// Get all projects without filtering
export const getProjects = createAsyncThunk(
  "project/getProjects",
  async (_, thunkAPI) => {
    try {
      const { data } = await axios.get(`${server}/project`, {
        withCredentials: true
      });
      
      console.log("API response data:", data);
      return data;
    } catch (error: any) {
      console.error("getProjects Error:", error);
      const message = error.response?.data?.message || 'Projeler alınamadı';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get a single project by slug
export const getProjectBySlug = createAsyncThunk(
  "project/getProjectBySlug",
  async (slug: string, thunkAPI) => {
    try {
      console.log(`Fetching project with slug: ${slug}`);
      const requestUrl = `${server}/project/${slug}`;
      console.log(`Request URL: ${requestUrl}`);
      
      const { data } = await axios.get(requestUrl, {
        withCredentials: true
      });
      
      console.log("getProjectBySlug response:", data);
      
      if (!data || !data.project) {
        console.error("No project data in response");
        return thunkAPI.rejectWithValue('Proje bulunamadı');
      }
      
      return data.project;
    } catch (error: any) {
      console.error("getProjectBySlug Error:", error);
      console.error("Full error object:", JSON.stringify(error, null, 2));
      const message = error.response?.data?.message || 'Proje alınamadı';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Create a new project
export interface CreateProjectPayload {
  title: string;
  description?: string;
  image?: string;
  category?: string;
  color?: string;
  contentBlocks?: Array<{
    type: string;
    content: string;
    metadata?: any;
  }>;
  markdownContent?: string;
  projectInfo?: Array<{
    title: string;
    data: string;
  }>;
  isPublished?: boolean;
}

export const createProject = createAsyncThunk(
  "project/createProject",
  async (payload: CreateProjectPayload, thunkAPI) => {
    try {
      const token = localStorage.getItem("accessToken");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        withCredentials: true,
      };
      
      const { data } = await axios.post(`${server}/project/create`, payload, config);
      return data.project;
    } catch (error: any) {
      console.error("createProject Error:", error);
      const message = error.response?.data?.message || 'Proje oluşturulamadı';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Update a project
export interface UpdateProjectPayload {
  projectId: string;
  title?: string;
  description?: string;
  image?: string;
  category?: string;
  color?: string;
  contentBlocks?: Array<{
    type: string;
    content: string;
    metadata?: any;
    order?: number;
  }>;
  markdownContent?: string;
  projectInfo?: Array<{
    title: string;
    data: string;
  }>;
  isPublished?: boolean;
}

export const updateProject = createAsyncThunk(
  "project/updateProject",
  async (payload: UpdateProjectPayload, thunkAPI) => {
    try {
      const { projectId, ...updateData } = payload;
      
      const token = localStorage.getItem("accessToken");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        withCredentials: true,
      };
      
      const { data } = await axios.put(`${server}/project/${projectId}`, updateData, config);
      return data.project;
    } catch (error: any) {
      console.error("updateProject Error:", error);
      const message = error.response?.data?.message || 'Proje güncellenemedi';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Delete a project
export const deleteProject = createAsyncThunk(
  "project/deleteProject",
  async (projectId: string, thunkAPI) => {
    try {
      const token = localStorage.getItem("accessToken");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        withCredentials: true,
      };
      
      const { data } = await axios.delete(`${server}/project/${projectId}`, config);
      return { projectId, message: data.message };
    } catch (error: any) {
      console.error("deleteProject Error:", error);
      const message = error.response?.data?.message || 'Proje silinemedi';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Add a content block to a project
export interface AddContentBlockPayload {
  projectId: string;
  type: string;
  content: string;
  metadata?: any;
}

export const addContentBlock = createAsyncThunk(
  "project/addContentBlock",
  async (payload: AddContentBlockPayload, thunkAPI) => {
    try {
      const { projectId, ...blockData } = payload;
      
      const token = localStorage.getItem("accessToken");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        withCredentials: true,
      };
      
      const { data } = await axios.post(`${server}/project/${projectId}/blocks`, blockData, config);
      return data.project;
    } catch (error: any) {
      console.error("addContentBlock Error:", error);
      const message = error.response?.data?.message || 'İçerik bloğu eklenemedi';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Remove a content block from a project
export interface RemoveContentBlockPayload {
  projectId: string;
  blockId: string;
}

export const removeContentBlock = createAsyncThunk(
  "project/removeContentBlock",
  async (payload: RemoveContentBlockPayload, thunkAPI) => {
    try {
      const { projectId, blockId } = payload;
      
      const token = localStorage.getItem("accessToken");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        withCredentials: true,
        data: { blockId }
      };
      
      const { data } = await axios.delete(`${server}/project/${projectId}/blocks`, config);
      return data.project;
    } catch (error: any) {
      console.error("removeContentBlock Error:", error);
      const message = error.response?.data?.message || 'İçerik bloğu kaldırılamadı';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Reorder content blocks within a project
export interface ReorderContentBlocksPayload {
  projectId: string;
  blocks: Array<{id: string, order: number}>;
}

export const reorderContentBlocks = createAsyncThunk(
  "project/reorderContentBlocks",
  async (payload: ReorderContentBlocksPayload, thunkAPI) => {
    try {
      const { projectId, blocks } = payload;
      
      const token = localStorage.getItem("accessToken");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        withCredentials: true,
      };
      
      const { data } = await axios.put(`${server}/project/${projectId}/blocks/reorder`, { blocks }, config);
      return data.project;
    } catch (error: any) {
      console.error("reorderContentBlocks Error:", error);
      const message = error.response?.data?.message || 'İçerik blokları yeniden sıralanamadı';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Update a content block
export interface UpdateContentBlockPayload {
  projectId: string;
  blockId: string;
  type?: string;
  content?: string;
  metadata?: any;
}

export const updateContentBlock = createAsyncThunk(
  "project/updateContentBlock",
  async (payload: UpdateContentBlockPayload, thunkAPI) => {
    try {
      const { projectId, ...updateData } = payload;
      
      const token = localStorage.getItem("accessToken");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        withCredentials: true,
      };
      
      const { data } = await axios.put(`${server}/project/${projectId}/blocks/update`, updateData, config);
      return data.project;
    } catch (error: any) {
      console.error("updateContentBlock Error:", error);
      const message = error.response?.data?.message || 'İçerik bloğu güncellenemedi';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get a project by ID
export const getProjectById = createAsyncThunk(
  "project/getProjectById",
  async (projectId: string, thunkAPI) => {
    try {
      const requestUrl = `${server}/project/id/${projectId}`;
      console.log("Making request to:", requestUrl);
      
      const { data } = await axios.get(requestUrl, {
        withCredentials: true
      });
      
      console.log("Project by ID response:", data);
      return data.project;
    } catch (error: any) {
      console.error("getProjectById Error:", error);
      console.error("Full error object:", JSON.stringify(error, null, 2));
      const message = error.response?.data?.message || 'Proje alınamadı';
      return thunkAPI.rejectWithValue(message);
    }
  }
); 