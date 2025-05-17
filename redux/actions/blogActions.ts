import axios from "axios";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { server } from "@/config";

// Get all blogs without filtering
export const getBlogs = createAsyncThunk(
  "blog/getBlogs",
  async (_, thunkAPI) => {
    try {
      const { data } = await axios.get(`${server}/blog`, {
        withCredentials: true
      });
      
      console.log("API response data:", data);
      return data;
    } catch (error: any) {
      console.error("getBlogs Error:", error);
      const message = error.response?.data?.message || 'Blog posts alınamadı';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get a single blog post by slug
export const getBlogBySlug = createAsyncThunk(
  "blog/getBlogBySlug",
  async (slug: string, thunkAPI) => {
    try {
      console.log(`Fetching blog with slug: ${slug}`);
      const requestUrl = `${server}/blog/${slug}`;
      console.log(`Request URL: ${requestUrl}`);
      
      const { data } = await axios.get(requestUrl, {
        withCredentials: true
      });
      
      console.log("getBlogBySlug response:", data);
      
      if (!data || !data.blog) {
        console.error("No blog data in response");
        return thunkAPI.rejectWithValue('Blog post bulunamadı');
      }
      
      return data.blog;
    } catch (error: any) {
      console.error("getBlogBySlug Error:", error);
      console.error("Full error object:", JSON.stringify(error, null, 2));
      const message = error.response?.data?.message || 'Blog post alınamadı';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Create a new blog post
export interface CreateBlogPayload {
  title: string;
  description?: string;
  image?: string;
  category?: string;
  contentBlocks?: Array<{
    type: string;
    content: string;
    metadata?: any;
  }>;
  markdownContent?: string;
  tags?: string[];
  isPublished?: boolean;
}

export const createBlog = createAsyncThunk(
  "blog/createBlog",
  async (payload: CreateBlogPayload, thunkAPI) => {
    try {
      const token = localStorage.getItem("accessToken");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        withCredentials: true,
      };
      
      const { data } = await axios.post(`${server}/blog/create`, payload, config);
      return data.blog;
    } catch (error: any) {
      console.error("createBlog Error:", error);
      const message = error.response?.data?.message || 'Blog oluşturulamadı';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Update a blog post
export interface UpdateBlogPayload {
  blogId: string;
  title?: string;
  description?: string;
  image?: string;
  category?: string;
  contentBlocks?: Array<{
    type: string;
    content: string;
    metadata?: any;
    order?: number;
  }>;
  markdownContent?: string;
  tags?: string[];
  isPublished?: boolean;
}

export const updateBlog = createAsyncThunk(
  "blog/updateBlog",
  async (payload: UpdateBlogPayload, thunkAPI) => {
    try {
      const { blogId, ...updateData } = payload;
      
      const token = localStorage.getItem("accessToken");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        withCredentials: true,
      };
      
      const { data } = await axios.put(`${server}/blog/${blogId}`, updateData, config);
      return data.blog;
    } catch (error: any) {
      console.error("updateBlog Error:", error);
      const message = error.response?.data?.message || 'Blog güncellenemedi';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Delete a blog post
export const deleteBlog = createAsyncThunk(
  "blog/deleteBlog",
  async (blogId: string, thunkAPI) => {
    try {
      const token = localStorage.getItem("accessToken");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        withCredentials: true,
      };
      
      const { data } = await axios.delete(`${server}/blog/${blogId}`, config);
      return { blogId, message: data.message };
    } catch (error: any) {
      console.error("deleteBlog Error:", error);
      const message = error.response?.data?.message || 'Blog silinemedi';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Add a content block to a blog post
export interface AddContentBlockPayload {
  blogId: string;
  type: string;
  content: string;
  metadata?: any;
}

export const addContentBlock = createAsyncThunk(
  "blog/addContentBlock",
  async (payload: AddContentBlockPayload, thunkAPI) => {
    try {
      const { blogId, ...blockData } = payload;
      
      const token = localStorage.getItem("accessToken");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        withCredentials: true,
      };
      
      const { data } = await axios.post(`${server}/blog/${blogId}/blocks`, blockData, config);
      return data.blog;
    } catch (error: any) {
      console.error("addContentBlock Error:", error);
      const message = error.response?.data?.message || 'İçerik bloğu eklenemedi';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Remove a content block from a blog post
export interface RemoveContentBlockPayload {
  blogId: string;
  blockId: string;
}

export const removeContentBlock = createAsyncThunk(
  "blog/removeContentBlock",
  async (payload: RemoveContentBlockPayload, thunkAPI) => {
    try {
      const { blogId, blockId } = payload;
      
      const token = localStorage.getItem("accessToken");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        withCredentials: true,
        data: { blockId }
      };
      
      const { data } = await axios.delete(`${server}/blog/${blogId}/blocks`, config);
      return data.blog;
    } catch (error: any) {
      console.error("removeContentBlock Error:", error);
      const message = error.response?.data?.message || 'İçerik bloğu kaldırılamadı';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Reorder content blocks within a blog post
export interface ReorderContentBlocksPayload {
  blogId: string;
  blocks: Array<{id: string, order: number}>;
}

export const reorderContentBlocks = createAsyncThunk(
  "blog/reorderContentBlocks",
  async (payload: ReorderContentBlocksPayload, thunkAPI) => {
    try {
      const { blogId, blocks } = payload;
      
      const token = localStorage.getItem("accessToken");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        withCredentials: true,
      };
      
      const { data } = await axios.put(`${server}/blog/${blogId}/blocks/reorder`, { blocks }, config);
      return data.blog;
    } catch (error: any) {
      console.error("reorderContentBlocks Error:", error);
      const message = error.response?.data?.message || 'İçerik blokları yeniden sıralanamadı';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Update a content block
export interface UpdateContentBlockPayload {
  blogId: string;
  blockId: string;
  type?: string;
  content?: string;
  metadata?: any;
}

export const updateContentBlock = createAsyncThunk(
  "blog/updateContentBlock",
  async (payload: UpdateContentBlockPayload, thunkAPI) => {
    try {
      const { blogId, ...updateData } = payload;
      
      const token = localStorage.getItem("accessToken");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        withCredentials: true,
      };
      
      const { data } = await axios.put(`${server}/blog/${blogId}/blocks/update`, updateData, config);
      return data.blog;
    } catch (error: any) {
      console.error("updateContentBlock Error:", error);
      const message = error.response?.data?.message || 'İçerik bloğu güncellenemedi';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get a blog by ID
export const getBlogById = createAsyncThunk(
  "blog/getBlogById",
  async (blogId: string, thunkAPI) => {
    try {
      const requestUrl = `${server}/blog/id/${blogId}`;
      console.log("Making request to:", requestUrl);
      
      const { data } = await axios.get(requestUrl, {
        withCredentials: true
      });
      
      console.log("Blog by ID response:", data);
      return data.blog;
    } catch (error: any) {
      console.error("getBlogById Error:", error);
      console.error("Full error object:", JSON.stringify(error, null, 2));
      const message = error.response?.data?.message || 'Blog post alınamadı';
      return thunkAPI.rejectWithValue(message);
    }
  }
); 